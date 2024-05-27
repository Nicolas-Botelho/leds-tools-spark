import path from "path";
import fs from "fs";
import { Attribute, ImportedEntity, LocalEntity, Model, Module, ModuleImport, isEnumX, isLocalEntity, isModule, isModuleImport } from "../../../../../language/generated/ast.js";
import { createPath } from "../../../../util/generator-utils.js";
import { RelationInfo, processRelations } from "../../../../util/relations.js";
import { CompositeGeneratorNode, Generated, expandToStringWithNL, toString } from "langium/generate";
import { generateModel } from "./model-generator.js";
import { generateEnum } from "./enum-generator.js";

export function generateModules(model: Model, target_folder: string) : void {

  const modules =  model.abstractElements.filter(isModule);

  const all_entities = modules.map(module => module.elements.filter(isLocalEntity)).flat()

  const relation_maps = processRelations(all_entities)

  const imported_entities = processImportedEntities(model)

  for(const mod of modules) {
    
    const package_name      = `${mod.name}`
    const MODULE_PATH       = createPath(target_folder, package_name.replaceAll(".","/"))    

    const supertype_classes = processSupertypes(mod)

    const mod_classes = mod.elements.filter(isLocalEntity)

    fs.writeFileSync(path.join(MODULE_PATH, `ContextDb.cs`), toString(generateContextDb(mod, package_name, relation_maps)))
    for(const cls of mod_classes) {
      const class_name = cls.name
      const {attributes, relations} = getAttrsAndRelations(cls, relation_maps)
      
      attributes

      fs.writeFileSync(path.join(MODULE_PATH,`${class_name}.cs`), toString(generateModel(cls, supertype_classes.has(cls), relations, package_name, imported_entities)))
      if (!cls.is_abstract){
      }
      
      
    }

    for (const enumx of mod.elements.filter(isEnumX)){
      fs.writeFileSync(path.join(MODULE_PATH,`${enumx.name}.cs`), generateEnum(enumx,package_name))
    }
  }
}

function processImportedEntities (application: Model): Map<ImportedEntity, ModuleImport | undefined> {
  const map: Map<ImportedEntity, ModuleImport | undefined> = new Map()

  for (const moduleImport of application.abstractElements.filter(isModuleImport)){
    moduleImport.entities.map(importedEntity => map.set(importedEntity, moduleImport));
  }

  return map
}


/**
 * Dado um módulo, retorna todos as classes dele que são usadas como Superclasses
 */
function processSupertypes(mod: Module) : Set<LocalEntity | undefined> {
  const set: Set<LocalEntity | undefined> = new Set()
  for(const cls of mod.elements.filter(isLocalEntity)) {
    
    if(cls.superType?.ref != null && isLocalEntity(cls.superType?.ref)) {
      set.add(cls.superType?.ref)
    }
  }
  return set
}

/**
 * Retorna todos os atributos e relações de uma Class, incluindo a de seus supertipos
 */
function getAttrsAndRelations(cls: LocalEntity, relation_map: Map<LocalEntity, RelationInfo[]>) : {attributes: Attribute[], relations: RelationInfo[]} {
  // Se tem superclasse, puxa os atributos e relações da superclasse
  if(cls.superType?.ref != null && isLocalEntity(cls.superType?.ref)) {
    const parent =  cls.superType?.ref
    const {attributes, relations} = getAttrsAndRelations(parent, relation_map)

    return {
      attributes: attributes.concat(cls.attributes),
      relations: relations.concat(relation_map.get(cls) ?? [])
    }
  } else {
    return {
      attributes: cls.attributes,
      relations: relation_map.get(cls) ?? []
    }
  }
}

function generateContextDb(mod : Module, package_name: string, relation_maps: Map<LocalEntity, RelationInfo[]>) : Generated {
  
   
  return expandToStringWithNL`
    namespace ${package_name}{

    using Microsoft.EntityFrameWorkCore;

    internal class ContextDb : Dbcontext
        {
            public ContextDb(DbContextOptions<ContextDb> options) : base(options) { }
            ${generateDbSet(mod)}
            ${generateDbRelations(mod, relation_maps)}
        
        }
    }
  `
}

function generateDbSet (mod : Module) : string {
    let dbsets = "";
    for(const cls of mod.elements.filter(isLocalEntity)) {
        dbsets += `public DbSet<${cls.name}> ${cls.name}s { get; set; } \n`
        dbsets += `public DbSet<${cls.name}> ${cls.name.toLowerCase()}s => Set<${cls.name}>();\n\n`
    }
    return dbsets
}

function generateDbRelations(mod : Module, relation_maps: Map<LocalEntity, RelationInfo[]>) : Generated {
    const node = new CompositeGeneratorNode()
    for (const cls of mod.elements.filter(isLocalEntity)) {
        const {relations} = getAttrsAndRelations(cls, relation_maps)

        for(const rel of relations) {
          node.append(generateRelation(cls, rel))
          node.appendNewLine()
        }
        
    }
    return node
}

function generateRelation(cls: LocalEntity, {tgt, card, owner}: RelationInfo) : Generated {
    switch(card) {
    case "OneToOne":
      if(owner) {
        return expandToStringWithNL`
          //OneToOne
          public ${tgt.name} ${tgt.name.toLowerCase()} { get; set; }
          public Guid ${tgt.name.toLowerCase()}Id {get; set; }
        `
      } else {
        return ''
      }
    case "OneToMany":
      if(owner) {
        return ''
      } else {
        return ''
      }
    case "ManyToOne":
      if(owner) {
        return expandToStringWithNL`
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<${cls.name}>()
                .HasMany(${cls.name.toLowerCase()} => ${cls.name.toLowerCase()}.${tgt.name}) 
                .WithOne(${tgt.name.toLowerCase()} => ${tgt.name.toLowerCase()}.${cls.name}) 
                .HasForeignKey<${tgt.name}>(${tgt.name.toLowerCase()} => ${tgt.name.toLowerCase()}.${cls.name}Id); 
        }
        `
      } else {
        return ''
      }
    case "ManyToMany":
      if(owner) {
        return expandToStringWithNL`
          //ManyToMany
          @JoinTable(
              name = "${cls.name.toLowerCase()}_${tgt.name.toLowerCase()}",
              joinColumns = @JoinColumn(name = "${cls.name.toLowerCase()}_id"),
              inverseJoinColumns = @JoinColumn(name = "${tgt.name.toLowerCase()}_id")
          )
          @Builder.Default
          private Set<${tgt.name}> ${tgt.name.toLowerCase()}s = new HashSet<>();
        `
      } else {
        return ''
      }
    }
  }