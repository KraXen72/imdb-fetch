import type { Component } from 'solid-js';

// import logo from './logo.svg';
// import styles from './App.module.css';

import SearchBar, { query } from "./comp/SearchBar";
import Results from './comp/Results';
import Details from './comp/Details';
import Footer from './comp/Footer';

import { results } from './lib/search';

const App: Component = () => {
  return (
		<>
			<div id="main-grid">
				<SearchBar />
				<Results results={results()} query={query()} />
				<Details />
				<Footer />
			</div>
			<input type="text" id="copyinp"/>
		</>
  );
};

export default App;
