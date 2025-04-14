import { expandToString } from "langium/generate"
import { LocalEntity, Model } from "../../../../../../language/generated/ast.js"
import fs from "fs"
import path from "path"

export function generate(model: Model, listClassCRUD: LocalEntity[], target_folder: string) : void {

    fs.writeFileSync(path.join(target_folder,"ServiceExtensions.cs"), generateServiceExtensions(model, listClassCRUD))
}

function generateAdd(model: Model, listClassCRUD: LocalEntity[]) : string {

    let adds = ""

    const listClassCRUDFlat = listClassCRUD.flat(1);

    for(const cls of listClassCRUDFlat) {
        adds += `services.AddScoped<I${cls.name}Service, ${cls.name}Service>();\n`
    }
    //}
    return adds
}

function generateServiceExtensions(model: Model, listClassCRUD: LocalEntity[]) : string {
    return expandToString`
using FluentValidation;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using ${model.configuration?.name}.Application.Interfaces.Entities;
using ${model.configuration?.name}.Application.Services.Entities;
using ${model.configuration?.name}.Application.Security.Interfaces;
using ${model.configuration?.name}.Application.Security.Services;
using ${model.configuration?.name}.Application.Shared.Behavior;
using System.Reflection;

namespace ${model.configuration?.name}.Application.Services
{
    public static class ServiceExtensions
    {
        public static void ConfigureApplicationApp(this IServiceCollection services)
        {
            services.AddAutoMapper(Assembly.GetExecutingAssembly());
            services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(Assembly.GetExecutingAssembly()));
            services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());
            services.AddTransient(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));

            services.AddTransient<IService, EmailService>();
            ${generateAdd(model, listClassCRUD)}
        }
    }
}`
}