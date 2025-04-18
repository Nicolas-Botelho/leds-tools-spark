import { isUseCase, isUseCasesModel, LocalEntity, Model, UseCase } from "../../../../language/generated/ast.js"
import fs from "fs";
import { generate as generateInfra } from "./Infrastructure/generate.js"
import { generate as generateTest } from "./DomainTest/generate.js"
import { generate as generateWeb } from "./WebAPI/generate.js"
import { generate as generateDomain } from "./Domain/generate.js"
import { generate as generateApplication } from "./Application/generate.js"
// import { generate as generateInfraTest } from "./InfraTest/generate.js"

export function generate(model: Model, usecase: UseCase, target_folder: string) : void {

    const application_folder = target_folder + `/${model.configuration?.name}.Application`
    const domain_folder = target_folder + `/${model.configuration?.name}.Domain`
    const domain_test_folder = target_folder + `/${model.configuration?.name}.Domain.Test`
    // const infra_test_folder = target_folder + `/${model.configuration?.name}.Infrastructure.Test`
    const webApi_folder = target_folder + `/${model.configuration?.name}.WebAPI`
    const infrastructure_folder = target_folder + `/${model.configuration?.name}.Infrastructure`

    fs.mkdirSync(application_folder, {recursive: true})
    fs.mkdirSync(domain_folder, {recursive: true})
    fs.mkdirSync(domain_test_folder, {recursive: true})
    fs.mkdirSync(webApi_folder, {recursive: true})
    fs.mkdirSync(infrastructure_folder, {recursive: true})
    // fs.mkdirSync(infra_test_folder, {recursive: true})

    generateInfra(model, infrastructure_folder);
    generateTest(model, domain_test_folder);
    generateDomain(model, domain_folder);
    // generateInfraTest(model, infra_test_folder);

    const listUCM = model.abstractElements.filter(isUseCasesModel);

    if ((listUCM.length != 0)) {

        const listClassCRUD: LocalEntity[] = [];

        for (const ucm of listUCM) {
            const listElem = ucm.elements.filter(isUseCase);
            for (const elem of listElem) {
                if ((elem.uctype == 'crud') && (elem.entity ?? "" != "")) {
                    listClassCRUD.push(elem.entity?.ref as LocalEntity);
                }
            }
        }

        if (listClassCRUD.length != 0){
            generateWeb(model, listClassCRUD, webApi_folder);
            generateApplication(model, listClassCRUD, application_folder);
        }
    }
}