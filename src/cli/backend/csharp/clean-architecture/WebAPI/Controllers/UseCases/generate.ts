import { expandToString } from "langium/generate"
import { Model, UseCase} from "../../../../../../../language/generated/ast.js"

export function generate(model: Model, uc: UseCase): string {
    return expandToString`
using AutoMapper;
${generateImports(model, uc)}
using ${model.configuration?.name}.WebAPI.Controllers.BaseControllers;
using ${model.configuration?.name}.Domain.Interfaces.Entities;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;

namespace ${model.configuration?.name}.WebApi.Controllers.UseCases
{
    [Route("api/${uc.name_fragment}")]
    [ApiController]
    public class ${uc.name_fragment}Controller : BaseController
    {

        public ${uc.name_fragment}Controller(IMediator mediator, IMapper mapper, ILogger<BaseController> logger) : base(mediator, mapper, logger)
        {
        }

        ${generateRoutes(uc)}
    }
}`
}

function generateRoutes(uc: UseCase): string {
    let routes = ""
    for (const event of uc.events) {
        routes += expandToString`
        [HttpPost("${event.name_fragment?.toLowerCase()}")]
        public async Task<ActionResult> ${event.name_fragment}()
        {
            _logger.LogInformation($"Requisicao: {Request.Method} - {Request.Path}");

            var stopwatch = Stopwatch.StartNew();
            var response = await _mediator.Send(new ${event.name_fragment}Command(), new CancellationToken());
            stopwatch.Stop();

            _logger.LogInformation($"A requisicao foi realizada com sucesso | Tempo: {stopwatch.ElapsedMilliseconds} ms");
            return ApiOkResult(response);
        }

        `
    }
    return routes
}

function generateImports(model: Model, uc: UseCase): string {
    let str = ""
    for (const event of uc.events) {
        str += expandToString`
        using ${model.configuration?.name}.Application.Features.${uc.name_fragment}Case.${event.name_fragment}.UseCases;`
    }
    return str
}