import { expandToString } from "langium/generate";
import { LocalEntity, Model } from "../../../../../../language/generated/ast.js"

export function generateODataExtension(model: Model, listClassRefCRUD: LocalEntity[]): string{
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
            ${generateEntitySets(model, listClassRefCRUD)}
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

function generateEntitySets(model: Model, listClassRefCRUD: LocalEntity[]) : string {
  
    // const modules =  model.abstractElements.filter(isModule);
    let entitySets = "";
    
    //for(const mod of modules) {
    for(const cls of listClassRefCRUD) {
        entitySets += `builder.EntitySet<${cls.name}ResponseDTO>("${cls.name.toLowerCase()}"); \n`
    }
    //}

    return entitySets;
  
}