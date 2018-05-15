import React from "react";
import ReactDOM from "react-dom";
import Pagination from "react-js-pagination";
import { Container, Input, Divider } from "semantic-ui-react";
import "./css/index.css";
import "semantic-ui-css/semantic.min.css";
import "../node_modules/bootstrap-less/bootstrap/bootstrap.less";
var elasticsearch = require("elasticsearch");
var client = new elasticsearch.Client({
  host: "localhost:9200",
  log: "trace"
});
class Logo extends React.Component {
  render() {
    return (
      <Container>
        <h2>Awesome Search</h2>
      </Container>
    );
  }
}
class SearchBar extends React.Component {
  constructor(props) {
    super(props);
    this.handleSearchTextChange = this.handleSearchTextChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  handleSearchTextChange(e) {
    this.props.onSearchTextChange(e.target.value);
  }
  handleSubmit(event) {
    this.props.onSubmit(event);
  }
  render() {
    return (
      <Container textAlign="center">
        <Input
          autoFocus="true"
          className="search-bar"
          type="text"
          placeholder="Search..."
          onChange={this.handleSearchTextChange}
          onKeyPress={this.handleSubmit}
        />
      </Container>
    );
  }
}
class Articles extends React.Component {
  render() {
    const articlesArr = [];
    this.props.articles.forEach(article => {
      articlesArr.push(<Article article={article} key={article._id} />);
      articlesArr.push(<Divider />);
    });
    return <Container>{articlesArr}</Container>;
  }
}
class Article extends React.Component {
  render() {
    const _source = this.props.article._source;
    return (
      <div>
        <h3>{_source.title}</h3>
        <p>{_source.description}</p>
      </div>
    );
  }
}
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      searchText: "",
      articles: [],
      activePage: 1,
      totalResult: 30
    };
    this.handleSearchTextChange = this.handleSearchTextChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handlePageChange = this.handlePageChange.bind(this);
  }
  handleSearchTextChange(searchText) {
    this.setState({
      searchText: searchText
    });
  }
  handlePageChange(pageNumber) {
    console.log(`active page is ${pageNumber}`);
    this.setState({activePage: pageNumber},function() {
      this.handleSubmit();
    });
  }
  handleSubmit(event) {
    if (event == null || event.key === "Enter") {
      let currentComponent = this;
      console.log(currentComponent.state.searchText);
      client
        .search({
          index: "tech",
          type: "_doc",
          body: {
            query: {
              match: {
                description: {
                  query: currentComponent.state.searchText,
                  fuzziness: "2"
                }
              }
            },
            from: (currentComponent.state.activePage-1)*10,
            size: 10
          }
        })
        .then(
          function(resp) {
            var hits = resp.hits.hits;
            currentComponent.setState({
              articles: hits,
              totalResult: resp.hits.total
            });
          },
          function(err) {
            console.trace(err.message);
          }
        );
    }
  }
  render() {
    return (
      <Container>
        <Logo />
        <SearchBar
          onSearchTextChange={this.handleSearchTextChange}
          onSubmit={this.handleSubmit}
        />
        <Articles articles={this.state.articles} />
        <div className="divPagination">
          <Pagination
            activePage={this.state.activePage}
            itemsCountPerPage={10}
            totalItemsCount={this.state.totalResult}
            pageRangeDisplayed={5}
            onChange={this.handlePageChange}
          />
        </div>
      </Container>
    );
  }
}

ReactDOM.render(<App />, document.getElementById("root"));
