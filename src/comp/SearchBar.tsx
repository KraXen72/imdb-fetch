export default function SearchBar() {
  return (
    <div id="inpholder">
      <label class="matter-textfield-outlined">
        <input
          placeholder=" "
          type="search"
          name="search"
          id="search"
          autocomplete="off"
        ></input>
        <span class="noselect">Search for movie/show by title or imdb id</span>
      </label>
    </div>
  );
}
