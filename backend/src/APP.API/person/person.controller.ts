import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { PersonService } from '../../APP.BLL/person/person.service';
import { SlugParamDto } from '../../APP.Shared/dto/slug-param.dto';
import { UuidParamDto } from '../../APP.Shared/dto/uuid-param.dto';

@ApiTags('persons')
@Controller('persons')
export class PersonController {
  constructor(private readonly personService: PersonService) {}

  @Get('feed')
  @ApiOperation({ summary: 'Get crime feed with pagination - latest crime per person' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10)' })
  @ApiResponse({ status: 200, description: 'Feed retrieved successfully' })
  getFeed(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = parseInt(page || '1', 10) || 1;
    const limitNum = parseInt(limit || '10', 10) || 10;
    return this.personService.getFeed(pageNum, limitNum);
  }

  @Get('id/:id')
  @ApiOperation({ summary: 'Get person by ID' })
  @ApiResponse({ status: 200, description: 'Person found' })
  @ApiResponse({ status: 400, description: 'Invalid UUID format' })
  @ApiResponse({ status: 404, description: 'Person not found' })
  getById(@Param() params: UuidParamDto) {
    return this.personService.getById(params.id);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get person by slug' })
  @ApiResponse({ status: 200, description: 'Person found' })
  @ApiResponse({ status: 400, description: 'Invalid slug format' })
  @ApiResponse({ status: 404, description: 'Person not found' })
  getBySlug(@Param() params: SlugParamDto) {
    // Route conflict handling - 'feed' and 'id' are reserved routes
    if (params.slug === 'feed' || params.slug === 'id') {
      return null;
    }
    return this.personService.getBySlug(params.slug);
  }
}
