import { expandToStringWithNL } from "langium/generate";
import { LocalEntity, Model, UseCase, Event } from "../../../../../../language/generated/ast.js"
import fs from "fs"
import path from "path";
export function generate(model: Model, listClassCRUD: LocalEntity[], listRefCRUD: LocalEntity[], listUCsNotCRUD: UseCase[], target_folder: string) : void {

    const entities_folder = target_folder + '/Entities'
    fs.mkdirSync(entities_folder, {recursive: true})

    fs.writeFileSync(path.join(target_folder,`BaseCRUDService.cs`), generateBaseCRUDService(model))
    fs.writeFileSync(path.join(target_folder,`BaseGetService.cs`), generateBaseGetService(model))
    fs.writeFileSync(path.join(target_folder,`BaseService.cs`), generateBaseService(model))

    for(const cls of listClassCRUD) {
        fs.writeFileSync(path.join(entities_folder,`${cls.name}Service.cs`), generateCRUDService(model, cls))
    }

    for(const uc of listUCsNotCRUD) {
        let uc_folder = `${target_folder}/${uc.name_fragment}` 
        fs.mkdirSync(uc_folder, {recursive: true})
        for (const event of uc.events){
            fs.writeFileSync(path.join(uc_folder,`${event.name_fragment}Service.cs`), generateGenericService(model, event))
        }
    }

    for(const cls of listRefCRUD) {
        fs.writeFileSync(path.join(entities_folder,`${cls.name}Service.cs`), generateGetService(model, cls))
    }
}

function generateCRUDService(model: Model, cls: LocalEntity) : string {
    return expandToStringWithNL`
using AutoMapper;
using ${model.configuration?.name}.Application.DTOs.Entities.Request;
using ${model.configuration?.name}.Application.DTOs.Entities.Response;
using ${model.configuration?.name}.Application.DTOs.Common;
using ${model.configuration?.name}.Application.Interfaces.Entities;
using ${model.configuration?.name}.Domain.Entities;
using ${model.configuration?.name}.Domain.Interfaces.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ${model.configuration?.name}.Application.Services.Entities
{
    public class ${cls.name}Service :
        BaseCRUDService<
            ${cls.name}RequestDTO,
            ${cls.name}ResponseDTO,
            ${cls.name},
            I${cls.name}Repository>, I${cls.name}Service
    {

        public ${cls.name}Service(IMediator mediator, IMapper mapper, I${cls.name}Repository repository) : base(mediator, mapper, repository) { }

    }
}`
}

function generateGetService(model: Model, cls: LocalEntity) : string {
    return expandToStringWithNL`
using AutoMapper;
using ${model.configuration?.name}.Application.DTOs.Entities.Request;
using ${model.configuration?.name}.Application.DTOs.Entities.Response;
using ${model.configuration?.name}.Application.DTOs.Common;
using ${model.configuration?.name}.Application.Interfaces.Entities;
using ${model.configuration?.name}.Domain.Entities;
using ${model.configuration?.name}.Domain.Interfaces.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ${model.configuration?.name}.Application.Services.Entities
{
    public class ${cls.name}Service :
        BaseGetService<
            ${cls.name}RequestDTO,
            ${cls.name}ResponseDTO,
            ${cls.name},
            I${cls.name}Repository>, I${cls.name}Service
    {

        public ${cls.name}Service(IMediator mediator, IMapper mapper, I${cls.name}Repository repository) : base(mediator, mapper, repository) { }

    }
}`
}

function generateGenericService(model: Model, event: Event) : string {
    return expandToStringWithNL`
using AutoMapper;
using ${model.configuration?.name}.Application.DTOs.Entities.Request;
using ${model.configuration?.name}.Application.DTOs.Entities.Response;
using ${model.configuration?.name}.Application.DTOs.Common;
using ${model.configuration?.name}.Application.Interfaces.Entities;
using ${model.configuration?.name}.Domain.Entities;
using ${model.configuration?.name}.Domain.Interfaces.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ${model.configuration?.name}.Application.Services.Entities
{
    public class ${event.name_fragment}Service :
        BaseService<
            BaseRequestDTO,
            BaseResponseDTO,         
            IBaseRepository>
    {

        public ${event.name_fragment}Service(IMediator mediator, IMapper mapper, IBaseRepository repository) : base(mediator, mapper, repository) { }

    }
}`
}

function generateBaseCRUDService(model: Model): string {
    return expandToStringWithNL`
using AutoMapper;
using AutoMapper.QueryableExtensions;
using ${model.configuration?.name}.Application.DTOs.Common;
using ${model.configuration?.name}.Application.Interfaces;
using ${model.configuration?.name}.Domain.Common;
using ${model.configuration?.name}.Domain.Interfaces.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ${model.configuration?.name}.Application.Services
{
    public class BaseCRUDService<Request, Response, Entity, Repository> : IBaseCRUDService<Request, Response, Entity>
       where Entity : BaseEntity
       where Response : BaseDTO
       where Repository : IBaseRepository<Entity>
    {
        protected readonly IMediator _mediator;
        protected readonly IMapper _mapper;
        protected readonly Repository _repository;

        public BaseCRUDService(IMediator mediator, IMapper mapper, Repository repository)
        {
            _mediator = mediator;
            _mapper = mapper;
            _repository = repository;
        }

        public virtual async Task<IQueryable<Response>> GetAll()
        {
            var result = _repository.GetAll();
            var response = result.ProjectTo<Response>(_mapper.ConfigurationProvider);
            return response;
        }

        public virtual async Task<IQueryable<Response>> GetById(Guid id)
        {
            var result = _repository.GetById(id);
            var response = result.ProjectTo<Response>(_mapper.ConfigurationProvider);
            return response;
        }

        public virtual async Task<ApiResponse> Create(Request request, CancellationToken cancellationToken)
        {
            var entity = _mapper.Map<Entity>(request);
            await _repository.Create(entity);
            return new ApiResponse(201, entity.Id.ToString(), "item criado com sucesso!");
        }

        public virtual async Task<ApiResponse> Delete(Guid id, CancellationToken cancellationToken)
        {
            var entity = await _repository.GetById(id).FirstOrDefaultAsync();
            await _repository.Delete(entity);
            return new ApiResponse(200, "item deletado com sucesso!");
        }

        public virtual async Task<ApiResponse> Update(Request request, CancellationToken cancellationToken)
        {
            var entity = _mapper.Map<Entity>(request);

            var result = await _repository.GetById(entity.Id).FirstOrDefaultAsync();
            result.Update(entity);

            await _repository.Update(result);
            return new ApiResponse(200, result.Id.ToString(), "item atualizado com sucesso!");
        }

        public virtual List<string> SaveValidation()
        {
            throw new NotImplementedException();

        }
    }
}`
}

function generateBaseGetService(model: Model): string {
    return expandToStringWithNL`
using AutoMapper;
using AutoMapper.QueryableExtensions;
using ${model.configuration?.name}.Application.DTOs.Common;
using ${model.configuration?.name}.Application.Interfaces;
using ${model.configuration?.name}.Domain.Common;
using ${model.configuration?.name}.Domain.Interfaces.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ${model.configuration?.name}.Application.Services
{
    public class BaseGetService<Request, Response, Entity, Repository> : IBaseGetService<Request, Response, Entity>
       where Entity : BaseEntity
       where Response : BaseDTO
       where Repository : IBaseRepository<Entity>
    {
        protected readonly IMediator _mediator;
        protected readonly IMapper _mapper;
        protected readonly Repository _repository;

        public BaseGetService(IMediator mediator, IMapper mapper, Repository repository)
        {
            _mediator = mediator;
            _mapper = mapper;
            _repository = repository;
        }

        public virtual async Task<IQueryable<Response>> GetAll()
        {
            var result = _repository.GetAll();
            var response = result.ProjectTo<Response>(_mapper.ConfigurationProvider);
            return response;
        }

        public virtual async Task<IQueryable<Response>> GetById(Guid id)
        {
            var result = _repository.GetById(id);
            var response = result.ProjectTo<Response>(_mapper.ConfigurationProvider);
            return response;
        }
    }
}`
}

function generateBaseService(model: Model): string {
    return expandToStringWithNL`
using AutoMapper;
using AutoMapper.QueryableExtensions;
using ${model.configuration?.name}.Application.DTOs.Common;
using ${model.configuration?.name}.Application.Interfaces;
using ${model.configuration?.name}.Domain.Common;
using ${model.configuration?.name}.Domain.Interfaces.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ${model.configuration?.name}.Application.Services
{
    public class BaseService<Request, Response, Repository>
       where Entity : BaseEntity
       where Response : BaseDTO
       where Repository : IBaseRepository<Entity>
    {
        protected readonly IMediator _mediator;
        protected readonly IMapper _mapper;
        protected readonly Repository _repository;

        public BaseGetService(IMediator mediator, IMapper mapper, Repository repository)
        {
            _mediator = mediator;
            _mapper = mapper;
            _repository = repository;
        }
    }
}`
}

