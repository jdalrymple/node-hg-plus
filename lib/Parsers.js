class Parsers {

    /*
    Parse command output as raw text content.

        repo.branches (err, out) ->
           console.log Parsers.text(out)
    */
    static text(out) {
      return (out.filter((o) => o.channel === 'o').map((o) => o.body)).join('');
  }

    /*
    Parse command output as json content. This is useful when JSON template
    is passed as an option to the command (i.e. `-Tjson`).

        repo.branches {"--template":"json"}, (err, out) ->
            branches = Parsers.json out
            branches.forEach (b) ->
               console.log "#{b.branch} #{b.active}"
    */
    static json(out) {
      return JSON.parse(Parsers.text(out));
  }

    /*
    Parse version from `version` command. Returns a string version number.
    */
    static version(out) {
        let versionRegEx = new RegExp(".*version (.*)\\)");
        let version = versionRegEx.exec(out[0].body);

        if (!version) {
            throw new Error("Unable to parse version data");
        }

        return version[1];
    }

    constructor(hgversion) {
        this.hgversion = hgversion;
    }

    /*
    Parse `tags` command text response. Returns an object with tag names as
    object keys. Key value is a 2 element array of revision number and revision
    hash.

        tags = {"<tag name>":["<rev number>":"<hash>"]}
    */
    tags(out) {
        let rest = out;
        let tags = {};
        while (rest[0].channel !== 'r') {
            let namerec, nl, verrec;
            [namerec, verrec, nl, ...rest] = rest;
            let name = namerec.body;
            let [lver, hver] = verrec.body.split(":");
            tags[name] = [lver.trim(), hver.trim()];
        }

        return tags;
    }

    /*
    Parse `status` command text response. Returns an object with file names as
    object keys. Key value is the status id.

        status = {"<file name>":"<status>"}
    */
    status(out) {
        let rest = out;
        let states = {};
        while (rest[0].channel !== 'r') {
            let filerec, staterec;
            [staterec, filerec, ...rest] = rest;
            let state = staterec.body.trim();
            let file = filerec.body.trim();
            states[file] = state;
        }

        return states;
    }
}

export default Parsers;
