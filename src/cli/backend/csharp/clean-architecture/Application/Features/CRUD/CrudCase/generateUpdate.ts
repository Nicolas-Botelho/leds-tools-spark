import { LocalEntity, Model, Relation } from "../../../../../../../../language/generated/ast.js";
import fs from "fs"
import { expandToString } from "langium/generate";
import path from "path"
import { RelationInfo } from "../../../../../../../util/relations.js";

export function generate ( model: Model, cls: LocalEntity, relations: RelationInfo[], target_folder: string) : void {

    fs.writeFileSync(path.join(target_folder, `Update${cls.name}Handler.cs`), generateHandler(model, cls))
    fs.writeFileSync(path.join(target_folder, `Update${cls.name}Command.cs`), generateCommand(model, cls, cls.relations))
    fs.writeFileSync(path.join(target_folder, `Update${cls.name}Validator.cs`), generateValidator(model, cls))
}

function generateHandler(model: Model, cls: LocalEntity) : string {
    return expandToString`
using AutoMapper;
using ${model.configuration?.name}.Application.Features.CRUD.${cls.name}Entity.DTOs;
using ${model.configuration?.name}.Application.Features.CRUD.${cls.name}Entity.Interface;
using ${model.configuration?.name}.Domain.Entities;
using ${model.configuration?.name}.Domain.Enums;
using ConectaFapes.Common.Infrastructure.Interfaces;
using ${model.configuration?.name}.Application.Features.BaseCase;

namespace ${model.configuration?.name}.Application.Features.CRUD.${cls.name}Entity.${cls.name}Case.Update
{
    public class Update${cls.name}Handler : UpdateHandler<I${cls.name}Service, Update${cls.name}Command, ${cls.name}RequestDTO, ${cls.name}ResponseDTO, ${cls.name}>
    {
        public Update${cls.name}Handler(IUnitOfWork unitOfWork, I${cls.name}Service service, IMapper mapper) : base(unitOfWork, service, mapper) { }
    }
}
`
}

function generateCommand(model: Model, cls: LocalEntity, relations: Relation[]) : string {
    return expandToString`
using ConectaFapes.Common.Domain;
using MediatR;
using ${model.configuration?.name}.Application.Features.CRUD.${cls.name}Entity.DTOs;
using ${model.configuration?.name}.Domain.Enums;

namespace ${model.configuration?.name}.Application.Features.CRUD.${cls.name}Entity.${cls.name}Case.Update
{
    public record Update${cls.name}Command(
      Guid Id,
      ${generateAttributesAndRelations(model, cls, relations)}
    ) : IRequest<TResult<${cls.name}ResponseDTO>>
    {

    }
}
`
}

function generateValidator(model: Model, cls: LocalEntity) : string {
    return expandToString`
using FluentValidation;

namespace ${model.configuration?.name}.Application.Features.CRUD.${cls.name}Entity.${cls.name}Case.Update
{
    public class Update${cls.name}Validator : AbstractValidator<Update${cls.name}Command>
    {
        public Update${cls.name}Validator()
        {

        }
    }
}
`
}

function generateAttributesAndRelations (model: Model, cls: LocalEntity, relations: Relation[]) : string {
    let add = ""
    let cont = 0

    for (const attr of cls.attributes) {
        add += `${attr.type}? ${attr.name},\n`;
    }

    for (const rel of relations) {
        if (cont != relations.length - 1) add += `Guid ${rel.type.ref}Id,\n`;
        else add += `Guid ${rel.type.ref}Id\n`;
        cont++
    }

    return add
}