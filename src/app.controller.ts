import { Controller, Get, Query, Req } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './auth/guards/jwt-access.guard';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get("hello")
  getHello(@Req() req: any): string {
    console.log(req.user);
    return this.appService.getHello();
  }

  @Public()
  @Get("naver-news")
  async getNaverNews(@Query("query") query: string = "코딩") {

    const res = await fetch(`https://openapi.naver.com/v1/search/news.json?query=${query}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Naver-Client-Id": "QG6dKC_ImdjEgeFA7VLc",
        "X-Naver-Client-Secret": "WipWxv8zMa"
      }
    });

    return res.json();
  }
}
