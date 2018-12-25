"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const cli = require("commander");
const codegen_1 = require("./codegen");
const pkg = require('../package.json');
cli
    .command('generate <file>')
    .description('Generate from Swagger file')
    .action((file) => {
    const result = codegen_1.CodeGen.getTypescriptCode({
        moduleName: 'Test',
        className: 'Test',
        swagger: JSON.parse(fs.readFileSync(file, 'utf-8')),
        lint: false
    });
    console.log(result);
});
cli.version(pkg.version);
cli.parse(process.argv);
if (!cli.args.length) {
    cli.help();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NsaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHlCQUF5QjtBQUN6QixpQ0FBaUM7QUFDakMsdUNBQW9DO0FBRXBDLE1BQU0sR0FBRyxHQUFHLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0FBRXZDLEdBQUc7S0FDRSxPQUFPLENBQUMsaUJBQWlCLENBQUM7S0FDMUIsV0FBVyxDQUFDLDRCQUE0QixDQUFDO0tBQ3pDLE1BQU0sQ0FBQyxDQUFDLElBQVksRUFBRSxFQUFFO0lBQ3JCLE1BQU0sTUFBTSxHQUFHLGlCQUFPLENBQUMsaUJBQWlCLENBQUM7UUFDckMsVUFBVSxFQUFFLE1BQU07UUFDbEIsU0FBUyxFQUFFLE1BQU07UUFDakIsT0FBTyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDbkQsSUFBSSxFQUFFLEtBQUs7S0FDZCxDQUFDLENBQUM7SUFDSCxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ3hCLENBQUMsQ0FBQyxDQUFDO0FBRVAsR0FBRyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDekIsR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7QUFFeEIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFO0lBQ2xCLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQztDQUNkIn0=