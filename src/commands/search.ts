import { Command } from "commander";
import axios from "axios";
import prompts from "prompts";
import WatchCommand from "./watch";
class SearchCommand {
  command: Command;
  constructor(command: Command) {
    this.command = command;
  }

  searchMovie(movie: string) {
    this.command.action(async (movie: string) => {
      console.log("[Searching]:", movie);
      const searchResult = await axios.get(
        `http://localhost:3030/movies/flixhq/${movie}`
      );
      const { data } = searchResult;
      const { results } = data;
      const movieList = results.map((movie: any) => {
        return {
          id: movie.id,
          title: movie.title,
          releaseDate: movie.releaseDate || movie.firstAirDate,
          type: movie.type,
        };
      });
      const searchConfig = await prompts([
        {
          type: "select",
          name: "movie",
          message: "Select Movie / TV",
          choices: movieList.map((movie: any) => ({
            title: `${movie.title} - [${movie.type}] (${movie.releaseDate})`,
            value: movie.id,
          })),
        },
      ]);
      const { watch } = await prompts([
        {
          type: "toggle",
          name: "watch",
          message: "Would you like to watch it Movie / TV",
          initial: true,
          active: "yes",
          inactive: "no",
        },
      ]);
      console.log(searchConfig);

      if (watch) {
        const isMovie = searchConfig.movie.split("/")[0] === "movie";
        const watch = new WatchCommand(this.command);
        watch.watchMovie(searchConfig.movie, isMovie ? "movie" : "tv");
      } else {
        console.log("See you later");
      }
    });

    this.command.parse(process.argv);
  }
}

export default SearchCommand;
