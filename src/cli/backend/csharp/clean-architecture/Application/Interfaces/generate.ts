// Gerar apenas Interfaces de uso comum

import { expandToString } from "langium/generate"
import { LocalEntity, Model } from "../../../../../../language/generated/ast.js"
import fs from "fs"
import path from "path"

export function generate(model: Model, listClassCRUD: LocalEntity[], listRefCRUD: LocalEntity[], target_folder: string) : void {

    const entities_folder = target_folder + '/Entities'

    fs.mkdirSync(entities_folder, {recursive: true})
    
    fs.writeFileSync(path.join(target_folder,`IBaseCRUDService.cs`), generateBaseCRUDService(model))

    fs.writeFileSync(path.join(target_folder,`IBaseGetService.cs`), generateBaseGetService(model))

    for(const cls of listClassCRUD) {
        fs.writeFileSync(path.join(entities_folder,`I${cls.name}Service.cs`), generateCRUDService(model, cls))
    }

    for(const cls of listRefCRUD) {
        fs.writeFileSync(path.join(entities_folder,`I${cls.name}Service.cs`), generateGetService(model, cls))
    }
}

function generateBaseCRUDService (model: Model): string {
    return expandToString`
﻿using ${model.configuration?.name}.Application.DTOs.Common;

namespace ${model.configuration?.name}.Application.Interfaces
{
    public interface IBaseCRUDService<Request, Response, Entity> : IBaseGetService<Request, Response, Entity>
    {
        Task<ApiResponse> Create(Request request, CancellationToken cancellationToken);
        Task<ApiResponse> Delete(Guid id, CancellationToken cancellationToken);
        Task<ApiResponse> Update(Request request, CancellationToken cancellationToken);
        abstract List<string> SaveValidation();

    }
}
`
}

function generateBaseGetService (model: Model): string {
    return expandToString`
﻿using ${model.configuration?.name}.Application.DTOs.Common;

namespace ${model.configuration?.name}.Application.Interfaces
{
    public interface IBaseGetService<Request, Response, Entity>
    {
        Task<IQueryable<Response>> GetAll();
        Task<IQueryable<Response>> GetById(Guid id);

    }
}
`
}

function generateCRUDService(model: Model, cls: LocalEntity) : string {
    return expandToString`
using ${model.configuration?.name}.Application.DTOs.Entities.Request;
using ${model.configuration?.name}.Application.DTOs.Entities.Response;
using ${model.configuration?.name}.Domain.Entities;

namespace ${model.configuration?.name}.Application.Interfaces.Entities
{
    public interface I${cls.name}Service : IBaseCRUDService<${cls.name}RequestDTO, ${cls.name}ResponseDTO, ${cls.name}>
    {
    }
}

`
}

function generateGetService(model: Model, cls: LocalEntity) : string {
    return expandToString`
using ${model.configuration?.name}.Application.DTOs.Entities.Request;
using ${model.configuration?.name}.Application.DTOs.Entities.Response;
using ${model.configuration?.name}.Domain.Entities;

namespace ${model.configuration?.name}.Application.Interfaces.Entities
{
    public interface I${cls.name}Service : IBaseGetService<${cls.name}RequestDTO, ${cls.name}ResponseDTO, ${cls.name}>
    {
    }
}

`
}