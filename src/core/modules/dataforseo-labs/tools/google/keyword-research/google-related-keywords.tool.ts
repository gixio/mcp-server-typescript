import { z } from 'zod';
import { DataForSEOClient } from '../../../../../client/dataforseo.client.js';
import { BaseTool } from '../../../../base.tool.js';

export class GoogleRelatedKeywordsTool extends BaseTool {
  constructor(private client: DataForSEOClient) {
    super(client);
  }

  getName(): string {
    return 'dataforseo_labs_google_related_keywords';
  }

  getDescription(): string {
    return `The Related Keywords endpoint provides keywords appearing in the
 "searches related to" SERP element
You can get up to 4680 keyword ideas by specifying the search depth. Each related keyword comes with the list of relevant product categories, search volume rate for the last month, search volume trend for the previous 12 months, as well as current cost-per-click and competition values. Moreover, this endpoint supplies minimum, maximum and average values of daily impressions, clicks and CPC for each result.

Datasource: DataForSEO SERPs Database
Search algorithm: depth-first search for queries appearing in the "search related to" element of SERP for the specified seed keyword.
`;
  }

  getParams(): z.ZodRawShape {
    return {
      keyword: z.string().describe(`target keyword`),
      depth: z.number().min(0).max(4).default(1).describe(`keyword search depth`),
      location_name: z.string().default("United States").describe(`full name of the location
required field
in format "Country"
example:
United Kingdom`),
      language_code: z.string().default("en").describe(
        `language code
        required field
        example:
        en`),
      limit: z.number().min(1).max(1000).default(10).optional().describe("Maximum number of keywords to return"),
      offset: z.number().min(0).optional().describe(
        `offset in the results array of returned keywords
        optional field
        default value: 0
        if you specify the 10 value, the first ten keywords in the results array will be omitted and the data will be provided for the successive keywords`
      ),
      filters: this.getFilterExpression().optional().describe(
        `you can add several filters at once (8 filters maximum)
        you should set a logical operator and, or between the conditions
        the following operators are supported:
        regex, not_regex, <, <=, >, >=, =, <>, in, not_in, match, not_match, ilike, not_ilike, like, not_like
        you can use the % operator with like and not_like, as well as ilike and not_ilike to match any string of zero or more characters
        merge operator must be a string and connect two other arrays, availible values: or, and.
example:
["keyword_data.keyword_info.search_volume",">",0]
[["keyword_info.search_volume","in",[0,1000]],
"and",
["keyword_data.keyword_info.competition_level","=","LOW"]]

[["keyword_data.keyword_info.search_volume",">",100],
"and",
[["keyword_data.keyword_info.cpc","<",0.5],
"or",
["keyword_data.keyword_info.high_top_of_page_bid","<=",0.5]]]`
      ),
      order_by: z.array(z.string()).optional().describe(
        `results sorting rules
optional field
you can use the same values as in the filters array to sort the results
possible sorting types:
asc – results will be sorted in the ascending order
desc – results will be sorted in the descending order
you should use a comma to set up a sorting type
example:
["keyword_data.keyword_info.competition,desc"]
default rule:
["keyword_data.keyword_info.search_volume,desc"]
note that you can set no more than three sorting rules in a single request
you should use a comma to separate several sorting rules
example:
["keyword_data.keyword_info.search_volume,desc","keyword_data.keyword_info.cpc,desc"]`
      ),
      include_clickstream_data: z.boolean().optional().default(false).describe(
        `Include or exclude data from clickstream-based metrics in the result`)
    };
  }

  async handle(params: any): Promise<any> {
    try {
      const response = await this.client.makeRequest('/v3/dataforseo_labs/google/related_keywords/live', 'POST', [{
        keyword: params.keyword,
        location_name: params.location_name,
        language_code: params.language_code,
        depth: params.depth,  
        limit: params.limit,
        offset: params.offset,
        filters: this.formatFilters(params.filters),
        order_by: this.formatOrderBy(params.order_by),
        include_clickstream_data: params.include_clickstream_data
      }]);
      return this.validateAndFormatResponse(response);
    } catch (error) {
      return this.formatErrorResponse(error);
    }
  }
} 