"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateCareerOpeningDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_career_opening_dto_1 = require("./create-career-opening.dto");
class UpdateCareerOpeningDto extends (0, mapped_types_1.PartialType)(create_career_opening_dto_1.CreateCareerOpeningDto) {
}
exports.UpdateCareerOpeningDto = UpdateCareerOpeningDto;
//# sourceMappingURL=update-career-opening.dto.js.map