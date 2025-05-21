// Gerar pasta para cada UC não CRUD
  // Gerar pasta para cada evento
    // Gerar Service, DTO, Interface e pasta UseCase para cada pasta
      // Gerar Command e Handler do evento dentro da pasta UseCase

import { Attribute, isLocalEntity, LocalEntity, Model, UseCase } from "../../../../../../language/generated/ast.js";
import { processRelations, RelationInfo } from "../../../../../util/relations.js";
import { generate as generateBaseCase } from "./BaseCase/generate.js"
import { generate as generateBaseGetCase } from "./BaseGetCase/generate.js"
import { generateCrudClass } from "./CRUD/generate.js"
import { generateGetClass } from "./CRUD/generate.js"
import fs from "fs"

export function generate (model: Model, listClassCRUD: LocalEntity[], listRefCRUD: LocalEntity[], listUCsNotCRUD: UseCase[], target_folder: string) : void {

    const BaseCase_Folder = target_folder + "/BaseCase"
    const BaseGetCase_Folder = target_folder + "/BaseGetCase"
    const Crud_Folder = target_folder + "/CRUD"

    fs.mkdirSync(BaseCase_Folder, {recursive: true})
    fs.mkdirSync(BaseGetCase_Folder, {recursive: true})
    fs.mkdirSync(Crud_Folder, {recursive: true})

    generateBaseCase(model, BaseCase_Folder)
    generateBaseGetCase(model, BaseGetCase_Folder)

    const listClassRefCRUD = listClassCRUD.concat(listRefCRUD)
    const relation_maps = processRelations(listClassRefCRUD)

    for (const cls of listClassCRUD) {
        const { relations } = getAttrsAndRelations(cls, relation_maps)
        const Cls_Folder = target_folder + `/${cls.name}Entity`
        fs.mkdirSync(Cls_Folder, {recursive: true})
        generateCrudClass(model, cls, relations, Cls_Folder)
    }

    for (const cls of listRefCRUD) {
        const { relations } = getAttrsAndRelations(cls, relation_maps)
        const Cls_Folder = target_folder + `/${cls.name}Entity`
        fs.mkdirSync(Cls_Folder, {recursive: true})
        generateGetClass(model, cls, relations, Cls_Folder)
    }

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