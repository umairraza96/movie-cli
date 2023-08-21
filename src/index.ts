#! /usr/bin/env node
import { Command } from "commander";
import SearchCommand from "./commands/search";
function main() {
  const program = new Command();

  program.version("0.0.1");

  program
    .argument("<string>", "Search Argument")
    .option("-s,--search", "Search for Movie/TV")
    .action(
      (
        movie: string,
        opts: {
          search: boolean;
        }
      ) => {
        if (opts.search) {
          const search = new SearchCommand(program);
          search.searchMovie(movie);
        }
      }
    );

  // Captures flags from cli
  program.parse(process.argv);
}

main();
