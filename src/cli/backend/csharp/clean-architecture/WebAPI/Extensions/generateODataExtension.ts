import { expandToString } from "langium/generate";
import { LocalEntity, Model } from "../../../../../../language/generated/ast.js"

export function generateODataExtension(model: Model, listClassCRUD: LocalEntity[]): string{
    return expandToString`
using ${model.configuration?.name}.Application.DTOs.Entities.Response;
using Microsoft.AspNetCore.OData;
using Microsoft.OData.Edm;
using Microsoft.OData.ModelBuilder;

namespace ${model.configuration?.name}.WebApi.Extensions
{
    public static class ODataExtension
    {
        private static IEdmModel GetEdmModel()
        {
            ODataConventionModelBuilder builder = new();
            ${generateEntitySets(model, listClassCRUD)}
            return builder.GetEdmModel();
        }

        public static void ODataConfiguration(this IServiceCollection services)
        {
            services.AddControllers(options =>
            {
                // Add filter exceptions here
            })
            .AddOData(options => options
                .SkipToken()
                .AddRouteComponents("api", GetEdmModel())
                .Select()
                .Filter()
                .OrderBy()
                .SetMaxTop(4)
                .Count()
                .Expand());
        }
    }
}`
}

function generateEntitySets(model: Model, listClassCRUD: LocalEntity[]) : string {
  
    // const modules =  model.abstractElements.filter(isModule);
    let entitySets = "";
    
    //for(const mod of modules) {
    for(const cls of listClassCRUD) {
        entitySets += `builder.EntitySet<${cls.name}ResponseDTO>("${cls.name.toLowerCase()}"); \n`
    }
    //}

    return entitySets;
  
}