import { Generated, expandToString } from "langium/generate";
import { Attribute, EnumEntityAtribute, LocalEntity, Model, Event, UseCase } from "../../../../../../../../language/generated/ast.js"
import fs from "fs"
import path from "path";
import { capitalizeString } from "../../../../../../../util/generator-utils.js";
import { RelationInfo } from "../../../../../../../util/relations.js";

export function generate(model: Model, target_folder: string, event: Event, uc: UseCase) : void {
    fs.writeFileSync(path.join(target_folder,`${event.name_fragment}Handler.cs`), generateHandler(model, event, uc))
    fs.writeFileSync(path.join(target_folder,`${event.name_fragment}Command.cs`), generateCommand(model, event, uc))
    fs.writeFileSync(path.join(target_folder,`${event.name_fragment}Validator.cs`), generateValidator(model, event, uc))
}

function generateHandler (model: Model, event: Event, uc: UseCase): string {
    return expandToString`
using AutoMapper;
using ${model.configuration?.name}.Application.DTOs.Entities.Request;
using ${model.configuration?.name}.Application.DTOs.Entities.Response;
using ${model.configuration?.name}.Application.Interfaces.Entities;
using ${model.configuration?.name}.Application.UseCase.BaseCase;
using ${model.configuration?.name}.Domain.Entities;
using ${model.configuration?.name}.Domain.Interfaces.Common;

namespace ${model.configuration?.name}.Application.UseCase.Entities.${uc.name_fragment}Case.${event.name_fragment}
{
    public class ${event.name_fragment}Handler : GenericHandler<I${event.name_fragment}Service, ${event.name_fragment}Command, ${event.name_fragment}RequestDTO, ${event.name_fragment}ResponseDTO, ${event.name_fragment}>
    {
        /* Description:
        ${event.description}
        */
        public ${event.name_fragment}Handler(IUnitOfWork unitOfWork, I${event.name_fragment}Service service, IMapper mapper) : base(unitOfWork, service, mapper) { }
    }
}`
}

function generateValidator (model: Model, event: Event, uc: UseCase): string {
    return expandToString`
using FluentValidation;

namespace ${model.configuration?.name}.Application.UseCase.Entities.${uc.name_fragment}Case.${event.name_fragment}
{
    public class ${event.name_fragment}Validator : AbstractValidator<${event.name_fragment}Command>
    {
        public ${event.name_fragment}Validator()
        {

        }
    }
}`
}

function generateCommand (model: Model, event: Event, uc: UseCase): string {
    return expandToString`
using ${model.configuration?.name}.Application.DTOs.Common;
using MediatR;
using ${model.configuration?.name}.Domain.Enums;

namespace ${model.configuration?.name}.Application.UseCase.Entities.${uc.name_fragment}Case.${event.name_fragment}
{
    public record ${event.name_fragment}Command() : IRequest<ApiResponse>;
}`
}

/*
function slicer(cls: LocalEntity, relations: RelationInfo[]): string {
    return expandToString`
    ${cls.attributes.map(a => generateAttribute(a)).join('\n')}
    ${generateEnum(cls)}
    ${generateRelationsRequest(cls, relations)}`
}


function generateAttribute(attribute:Attribute): string{
    return expandToString`
    ${generateTypeAttribute(attribute) ?? 'NOTYPE'} ${capitalizeString(attribute.name)},
    `
}

function generateTypeAttribute(attribute:Attribute): string | undefined {

    if (attribute.type.toString().toLowerCase() === "date"){
        return "DateTime"
    }
    if (attribute.type.toString().toLowerCase() === "cpf"){
        return "String"
    }
    if (attribute.type.toString().toLowerCase() === "boolean"){
      return "bool"
    }
    if (attribute.type.toString().toLowerCase() === "email"){
        return "String"
    }
    if (attribute.type.toString().toLowerCase() === "file"){
        return "Byte[]"
    }
    if (attribute.type.toString().toLowerCase() === "mobilephonenumber"){
        return "String"
    }
    if (attribute.type.toString().toLowerCase() === "zipcode"){
        return "String"
    }
    if (attribute.type.toString().toLowerCase() === "phonenumber"){
        return "String"
    }
    if (attribute.type.toString().toLowerCase() === "integer"){
      return "int"
    }
    return attribute.type

}

function generateRelationsRequest(cls: LocalEntity, relations: RelationInfo[]) : string {
  
    let node = ''
  
    for(const rel of relations) {
      node += (generateRelation(cls, rel)) + '\n'
    }
    return node
  }

  function generateRelation(cls: LocalEntity, {tgt, card, owner}: RelationInfo) : Generated {
    switch(card) {
    case "OneToOne":
      if(owner) {
        return expandToString`
            Guid ${capitalizeString(tgt.name)}Id,`
      } else {
        return expandToString`
            Guid ${capitalizeString(tgt.name)}Id,`
      }
    case "OneToMany":
      if(owner) {
        return ''
      } else {
        return ''
      }
    case "ManyToOne":
      if(owner) {
        return expandToString`
            Guid ${capitalizeString(tgt.name)}Id,`
      } else {
        return ''
      }
    case "ManyToMany":
      if(owner) {
        return expandToString`
            Guid ${capitalizeString(tgt.name)}Id,`
      } else {
        return ''
      }
    }
  }

  function generateEnum (cls: LocalEntity):string {
    return expandToString`
    ${cls.enumentityatributes.map(enumEntityAtribute =>UpdateEnum(enumEntityAtribute)).join("\n")}
    `
  }

  function UpdateEnum(enumEntityAtribute: EnumEntityAtribute):string {
    return expandToString`
    ${enumEntityAtribute.type.ref?.name} ${enumEntityAtribute.type.ref?.name.toLowerCase()},
    `
  }
  */