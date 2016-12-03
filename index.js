import HGCommandServer from "./HGCommandServer";
import HGRepo from "./HGRepo";
import Parsers from "./parsers";

/*
The public facing API of the node-hg module exposes convenience methods for various common Mercurial tasks.
*/
class HGAPI {
	constructor() {}

	init(initPath, opts, done) {
		return HGRepo.MakeTempRepo(function(err, repo) {
			if (err) { return done(err); }

			return repo.init(initPath, done);
		});
	}

	clone(from, to, opts, done) {
		return HGRepo.MakeTempRepo(function(err, repo) {
			if (err) { return done(err); }

			return repo.clone(from, to, opts, done);
		});
	}

	add(path, opts, done) {
		let repo = new HGRepo(path);

		return repo.add(opts, done);
	}

	commit(path, opts, done) {
		let repo = new HGRepo(path);

		return repo.commit(opts, done);
	}

	summary(path, opts, done) {
		let repo = new HGRepo(path);

		return repo.summary(opts, done);
	}

	log(path, opts, done) {
		let repo = new HGRepo(path);

		return repo.log(opts, done);
	}
		
	version(done) {
		let repo = new HGRepo(null);
		
		return repo.version(done);
	}

	makeParser(done) {
		return api.version((err, out) => done(err, new Parsers(Parsers.version(out))));
	}
}

var api = new HGAPI();

api.HGCommandServer = HGCommandServer;
api.HGRepo = HGRepo;
api.Parsers = Parsers;
export default api;