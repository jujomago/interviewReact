import React from "react";
import "./styles.css";

const characterSort = (first, second) => {
  if (first.name.toLowerCase() === second.name.toLowerCase()) return 0;
  return first.name.toLowerCase() > second.name.toLowerCase() ? 1 : -1;
};

const Character = ({ name }) => (
  <React.Fragment>
    <dt>Name</dt>
    <dd>{name}</dd>
  </React.Fragment>
);

class Characters extends React.Component {
  state = {
    characters: [],
    loading: true
  };

  async getAllDataSerie(ApiUrl) {
    let pageNumber = 1;
    const results = [];
    let nextPage = "";

    do {
      const response = await fetch(`${ApiUrl}?page=${pageNumber}`);
      const data = await response.json();
      results.push(data.results);
      nextPage = data.next;
      pageNumber++;
    } while (nextPage != null);

    return results;
  }

  async getAllDataParalel(ApiUrl) {
    let pageNumber = 1;

    const response = await fetch(`${ApiUrl}?page=${pageNumber}`);
    const data = await response.json();
    const totalRows = data.count;
    const numberOfPages = Math.ceil(totalRows / data.results.length);
    const allResults = data.results;

    let allUrls = [];
    for (let index = 2; index <= numberOfPages; index++) {
      allUrls.push(fetch(`${ApiUrl}?page=${index}`));
    }
    const responses = await Promise.all(allUrls);
    const responsesJson = await Promise.all(responses.map(res => res.json()));

    responsesJson.forEach(json => allResults.push(...json.results));
    return allResults;
  }

  async componentDidMount() {
    const ApiUrl = "https://swapi.dev/api/people/";

    // posible solutions for fetching all data
    //const personajes = await this.getAllDataSerie(ApiUrl);
    const personajes = await this.getAllDataParalel(ApiUrl);

    this.setState({ characters: personajes.flat(), loading: false });
  }

  render() {
    const { characters, loading } = this.state;
    const sorted = characters.sort(characterSort);

    if (loading) return <h3>loading...</h3>;
    return (
      <dl className="App-character-list">
        {sorted.map(character => (
          <Character {...character} />
        ))}
      </dl>
    );
  }
}

export default class App extends React.Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/6/6c/Star_Wars_Logo.svg"
            className="App-logo"
            alt="logo"
          />
        </header>
        <h1 className="App-title">Characters</h1>
        <Characters />
      </div>
    );
  }
}
