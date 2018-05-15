# -*- coding: utf-8 -*-
import scrapy


class TechSpider(scrapy.Spider):
    name = 'tech'
    start_urls = ['https://vnexpress.net/tin-tuc/khoa-hoc']
    limit_pages = 10000
    count_pages = 0
    def parse(self, response):
        # print("PARSE-------")
        for article in response.css('article.list_news'):
            # print("IN LOOP PARSE-------")
            article_page = article.css('h3.title_news a::attr(href)').extract_first()
            if article_page is not None:
                yield response.follow(article_page,callback=self.parse_article)

        if self.count_pages < self.limit_pages:
            # print("AFTER YIELD---------------------------")
            next_page = response.css('div#pagination a.next::attr(href)').extract_first()
            if next_page is not None:
                yield response.follow(next_page, callback=self.parse)
    def parse_article(self,response):
        if self.count_pages < self.limit_pages:
            # print("PARSE ARTICLES------------------")
            content = response.css('article.content_detail p.Normal::text').extract()
            content = ' '.join(content)
            if len(content) > 100:
                self.count_pages += 1
                yield{
                    "index":{"_id":self.count_pages},
                }
                yield{
                    'group': 1,
                    'time': response.css('span.time::text').extract_first(),
                    'title': response.css('h1.title_news_detail::text').extract_first().strip(),
                    'description': response.css('h2.description::text').extract_first(),
                    'content': content,
                    'link': response.request.url
                }