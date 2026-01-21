import { Controller, Get, Post, Body, Param, Delete, Patch, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CrimeService } from '../../APP.BLL/crime/crime.service';
import { CreateCrimeDto } from '../../APP.Shared/dto/create-crime.dto';
import { CreateCrimeWithPersonDto } from '../../APP.Shared/dto/create-crime-with-person.dto';
import { UpdateCrimeStatusDto } from '../../APP.Shared/dto/update-crime-status.dto';
import { SlugParamDto } from '../../APP.Shared/dto/slug-param.dto';
import { UuidParamDto } from '../../APP.Shared/dto/uuid-param.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../APP.Shared/enums/user-role.enum';

@ApiTags('crimes')
@Controller('crimes')
export class CrimeController {
  constructor(private readonly crimeService: CrimeService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new crime report (with or without creating person)' })
  @ApiResponse({ status: 201, description: 'Crime created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Person not found' })
  create(@Body() createCrimeDto: CreateCrimeWithPersonDto) {
    return this.crimeService.createWithPerson(createCrimeDto);
  }

  @Get('person/:slug')
  @ApiOperation({ summary: 'Get all crimes for a person by slug' })
  @ApiResponse({ status: 200, description: 'Crimes retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Invalid slug format' })
  findByPersonSlug(@Param() params: SlugParamDto) {
    return this.crimeService.findByPersonSlug(params.slug);
  }

  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all crimes (Admin only)' })
  @ApiResponse({ status: 200, description: 'All crimes retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  findAll() {
    return this.crimeService.findAll();
  }

  @Get('admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get crime by ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'Crime retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Invalid UUID format' })
  @ApiResponse({ status: 404, description: 'Crime not found' })
  findById(@Param() params: UuidParamDto) {
    return this.crimeService.findById(params.id);
  }

  @Delete('admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a crime (Admin only)' })
  @ApiResponse({ status: 200, description: 'Crime deleted successfully' })
  @ApiResponse({ status: 400, description: 'Invalid UUID format' })
  @ApiResponse({ status: 404, description: 'Crime not found' })
  async delete(@Param() params: UuidParamDto) {
    await this.crimeService.delete(params.id);
    return { message: 'Crime deleted successfully' };
  }

  @Patch('admin/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update crime verification status (Admin only)' })
  @ApiResponse({ status: 200, description: 'Crime status updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid status or UUID format' })
  @ApiResponse({ status: 404, description: 'Crime not found' })
  updateStatus(@Param() params: UuidParamDto, @Body() updateStatusDto: UpdateCrimeStatusDto) {
    return this.crimeService.updateStatus(params.id, updateStatusDto.status);
  }
}
