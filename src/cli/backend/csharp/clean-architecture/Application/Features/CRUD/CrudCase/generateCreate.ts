import { LocalEntity, Model } from "../../../../../../../../language/generated/ast.js";
import fs from "fs"
import { expandToString } from "langium/generate";
import path from "path"

export function generate ( model: Model, cls: LocalEntity, target_folder: string) : void {
    fs.writeFileSync(path.join(target_folder, `Create${cls.name}Handler.cs`), generateHandler(model, cls))
    fs.writeFileSync(path.join(target_folder, `Create${cls.name}Command.cs`), generateCommand(model, cls))
    fs.writeFileSync(path.join(target_folder, `Create${cls.name}Validator.cs`), generateValidator(model, cls))
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

namespace ${model.configuration?.name}.Application.Features.CRUD.${cls.name}Entity.${cls.name}Case.Create
{
    public class Create${cls.name}Handler : CreateHandler<I${cls.name}Service, Create${cls.name}Command, ${cls.name}RequestDTO, ${cls.name}ResponseDTO, ${cls.name}>
    {
        public Create${cls.name}Handler(IUnitOfWork unitOfWork, I${cls.name}Service service, IMapper mapper) : base(unitOfWork, service, mapper)
        {
        }
    }
}
`
}

function generateCommand(model: Model, cls: LocalEntity) : string {
    return expandToString`
using ConectaFapes.Common.Domain;
using MediatR;
using ${model.configuration?.name}.Application.Features.CRUD.${cls.name}Entity.DTOs;
using ${model.configuration?.name}.Domain.Enums;

namespace ${model.configuration?.name}.Application.Features.CRUD.${cls.name}Entity.${cls.name}Case.Create
{
    public record Create${cls.name}Command(
      string? Nome,
      string? Distrito
    ) : IRequest<TResult<${cls.name}ResponseDTO>>
    {

    }
}
`
}

function generateValidator(model: Model, cls: LocalEntity) : string {
    return expandToString`
using FluentValidation;

namespace ${model.configuration?.name}.Application.Features.CRUD.${cls.name}Entity.${cls.name}Case.Create
{
    public class Create${cls.name}Validator : AbstractValidator<Create${cls.name}Command>
    {
        public Create${cls.name}Validator()
        {
        }
    }
}
`
}