import axios from "axios";
import { spawn } from "child_process";
import { Command } from "commander";
import prompts from "prompts";
const clipboardy = import("clipboardy");

class WatchCommand {
  command: Command;
  constructor(command: Command) {
    this.command = command;
  }

  async watchMovie(movie: string, type: "movie" | "tv") {
    try {
      this.command.description("Pass id to watch movie").action(async () => {
        console.log("[Watching]:", movie);

        const searchResult = await axios.get(
          `http://localhost:3030/movies/flixhq/info?id=${movie}`
        );

        const { data } = searchResult;
        if (type === "movie") {
          const { episodes } = data;
          const [episode] = episodes;
          const id = episode.id;
          const watchResult = await axios.get(
            `http://localhost:3030/movies/flixhq/watch?episodeId=${id}&mediaId=${movie}`
          );
          const { data: watchData } = watchResult;
          const { sources } = watchData;
          const sourceConfig = await prompts([
            {
              type: "select",
              name: "source",
              message: "Select Source",
              choices: sources.map((source: any) => ({
                title: `${source.quality}`,
                value: source,
              })),
            },
          ]);

          const sourceObject: any = sources.reduce((acc: any, curr: any) => {
            return {
              ...acc,
              [curr.quality]: curr,
            };
          }, {});

          const { source: selectedSource } = sourceConfig;
          (await clipboardy).default.writeSync(`mpv ${selectedSource.url}`);
          return console.log("Copied to clipboard 📋");
        }

        const { title, rating, duration, episodes } = data;
        const seasons = episodes.map((episode: any) => {
          return episode.season;
        });

        const seasonsSet = new Set(seasons);
        const season = [...seasonsSet];

        //Object with season number as keys with array of episodes as values
        const seasonObject: any = season.reduce((acc: any, curr: any) => {
          return {
            ...acc,
            [curr]: episodes.filter((episode: any) => {
              return episode.season === curr;
            }),
          };
        }, {});

        const config = await prompts([
          {
            type: "select",
            name: "season",
            message: "Select Season",
            choices: season.map((seas: any) => ({
              title: `Season ${seas}`,
              value: seas,
            })),
          },
        ]);

        const { season: selectedSeason } = config;

        const episdoes = seasonObject[selectedSeason];

        //Object with episode number as keys with array of episodes as values
        const episodeObject: any = episdoes.reduce((acc: any, curr: any) => {
          return {
            ...acc,
            [curr.id]: curr,
          };
        }, {});

        const episodeConfig = await prompts([
          {
            type: "select",
            name: "episode",
            message: "Select Episode",
            choices: episdoes.map((episode: any) => ({
              title: `# ${episode.number}: ${episode.title}`,
              value: episode.id,
            })),
          },
        ]);

        const { episode: selectedEpisodeNo } = episodeConfig;
        const selectedEpisode = episodeObject[selectedEpisodeNo];
        //   console.log({ mediaId: movie, episodeId: selectedEpisodeNo });
        const watchResult = await axios.get(
          `http://localhost:3030/movies/flixhq/watch?episodeId=${selectedEpisodeNo}&mediaId=${movie}`
        );
        const { data: watchData } = watchResult;
        //   console.log(watchData);
        const { sources, subtitles } = watchData;
        const englishSubtitle = subtitles.find(
          (subtitle: any) => subtitle.lang === "English"
        );
        const subtitleUrl = englishSubtitle ? englishSubtitle.url : "";
        //   console.log({ englishSubtitle });
        const sourceConfig = await prompts([
          {
            type: "select",
            name: "source",
            message: "Select Source",
            choices: sources.map((source: any) => ({
              title: `${source.quality}`,
              value: source,
            })),
          },
        ]);

        const sourceObject: any = sources.reduce((acc: any, curr: any) => {
          return {
            ...acc,
            [curr.quality]: curr,
          };
        }, {});

        const { source: selectedSource } = sourceConfig;
        (await clipboardy).default.writeSync(
          `mpv ${selectedSource.url} ${
            englishSubtitle ? `--sub-file=${subtitleUrl}` : ""
          }`
        );
        // const mpv = spawn("mpv", [
        //   selectedSource.url,
        //   "--sub-file",
        //   subtitleUrl,
        // ]);
        // mpv.stdout.on("data", (data) => {
        //   console.log(`stdout: ${data}`);
        // });
        // mpv.stderr.on("data", (data) => {
        //   console.error(`stderr: ${data}`);
        // });
        // mpv.on("error", (error) => {
        //   console.error(`error: ${error.message}`);
        // });
        // mpv.on("close", (code) => {
        //   console.log(`child process exited with code ${code}`);
        // });
        console.log("Copied to clipboard 📋");
      });

      this.command.parse(process.argv);
    } catch (error) {
      console.log(`Error: ${error}`);
    }
  }
}

export default WatchCommand;
