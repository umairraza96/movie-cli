#! /usr/bin/env node
import { Command } from "commander";
import SearchCommand from "./commands/search";
import { Options } from "./types/commands/options";
import WatchCommand from "./commands/watch";
function main() {
  const program = new Command();

  program.version("0.0.1");

  program
    .argument("<string>", "Search Argument")
    .option("-s,--search", "Search for Movie/TV")
    .option(
      "-w,--watch",
      "Watch Movie/TV with ID *type is required* (movie/tv)"
    )
    .option("-t,--type <type>", "Type of Movie/TV (movie/tv)")
    .action((movieOrTV: string, opts: Options) => {
      console.log(opts);
      if (opts.search) {
        const search = new SearchCommand(program);
        search.searchMovie(movieOrTV);
      }

      if (opts.watch && !opts.type) {
        console.log("Type is required check -h for more info");
      }

      if (opts.watch && opts.type) {
        const watch = new WatchCommand(program);
        watch.watchMovie(movieOrTV, opts.type);
      }
    });

  // Captures flags from cli
  program.parse(process.argv);
}

main();
