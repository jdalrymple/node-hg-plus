fs = require "fs"
path = require "path"

should = require "should"
uuid = require "uuid"

HGRepo = require "../lib/HGRepo"

describe "HGRepo", ->

	it "can create a temporary repo", (done) ->
		HGRepo.MakeTempRepo (err, repo) ->
			throw err if err

			should.exist repo
			
			fs.exists repo.path, (exists) ->
				exists.should.equal true

				done()

	it "can add files to a repo", (done) ->
		HGRepo.MakeTempRepo (err, repo) ->

			fs.writeFile path.join(repo.path, "one.txt"), "Text Content 1", (err) ->
				throw err if err

				fs.writeFile path.join(repo.path, "two.txt"), "Text Content 2", (err) ->
					throw err if err

					repo.add ['.'], (err, output) ->
						throw err if err

						output.length.should.equal 3

						done()

	it "can commit changes to a repo", (done) ->
		HGRepo.MakeTempRepo (err, repo) ->

			fs.writeFile path.join(repo.path, "one.txt"), "Text Content 1", (err) ->
				throw err if err

				fs.writeFile path.join(repo.path, "two.txt"), "Text Content 2", (err) ->
					throw err if err

					repo.add ['.'], (err, output) ->
						throw err if err

						output.length.should.equal 3

						commitOpts = 
							"-m": "A Test Commit"

						repo.commit commitOpts, (err, output) ->
							throw err if err

							should.exist output
							output.length.should.equal 1
							output[0].channel.should.equal "r"

							repo.log (err, output) ->
								throw err if err

								output.length.should.be.above 0
								output[0].body.indexOf("A Test Commit").should.be.above -1

								done()

	it "can clone a repo from a local path", (done) ->
		HGRepo.MakeTempRepo (err, repo) ->

			fs.writeFile path.join(repo.path, "one.txt"), "Text Content 1", (err) ->
				throw err if err

				fs.writeFile path.join(repo.path, "two.txt"), "Text Content 2", (err) ->
					throw err if err

					repo.add ['.'], (err, output) ->
						throw err if err

						output.length.should.equal 3

						commitOpts = 
							"-m": "A Test Commit"

						repo.commit commitOpts, (err, output) ->
							throw err if err

							should.exist output

							otherPath = path.resolve(path.join(repo.path, "..", uuid.v1()))
							
							repo.clone repo.path, otherPath, (err, output) ->
								throw err if err

								should.exist output

								otherRepo = new HGRepo(otherPath)

								otherRepo.summary (err, output) ->
									throw err if err

									should.exist output

									done()
