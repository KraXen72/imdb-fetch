import type { Component } from 'solid-js';

// import logo from './logo.svg';
// import styles from './App.module.css';

import SearchBar from './comp/SearchBar';
import Results from './comp/Results';
import Details from './comp/Details';
import Footer from './comp/Footer';

const App: Component = () => {
  return (
		<div id="main-grid">
			<SearchBar />
			<Results />
			<Details />
			<Footer />
		</div>
  );
};

export default App;
