from flask import Flask, request, redirect, url_for
from werkzeug import secure_filename
import os
import traceback

UPLOAD_FOLDER = os.path.abspath("uploads")
ALLOWED_EXTENSIONS = set(["osr"])

if not(os.path.exists(UPLOAD_FOLDER)):
	os.mkdir(UPLOAD_FOLDER)

app = Flask(__name__)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

def allowed_file(filename):
	return "." in filename and \
		filename.rsplit(".", 1)[1] in ALLOWED_EXTENSIONS

READ_BYTE = 0
READ_INT = 1
READ_SHORT = 5
READ_LONG = 2
READ_ULEB = 3
READ_STRING = 4

current_position = 0

def check(p):
	global current_position
	current_position = 0
	def read(t, length=None):
		global current_position
		if t == READ_BYTE:
			current_position += 1
			return ord(replay[current_position - 1:current_position])
		elif t == READ_INT:
			current_position += 4
			bytes = replay[current_position - 4:current_position]
			return sum([ord(bytes[i])*256**i for i in range(len(bytes))])
		elif t == READ_SHORT:
			current_position += 2
			bytes = replay[current_position - 2:current_position]
			return sum([ord(bytes[i])*256**i for i in range(len(bytes))])
		elif t == READ_LONG:
			current_position += 8
			bytes = replay[current_position - 8:current_position]
			return sum([ord(bytes[i])*256**i for i in range(len(bytes))])
		elif t == READ_ULEB:
			bytes = []
			while True:
				current_position += 1
				byte = replay[current_position - 1:current_position]
				bytes.append(byte)
				if (ord(byte) & 0x80) == 0x00: break
			return sum([ord(bytes[i])*256**i for i in range(len(bytes))])
		elif t == READ_STRING:
			current_position += length
			return replay[current_position - length:current_position]
	def reset_position():
		current_position = 0
	try:
		replay = open(p, "rb").read()
		MODE = read(READ_BYTE)
		assert MODE == 0
		VERSION = read(READ_INT)
		assert VERSION == 20160227
		assert read(READ_BYTE) == 0x0B
		BEATMAP_HASH = read(READ_STRING, read(READ_BYTE))
		assert BEATMAP_HASH == "f01ab2e4e46b973bb8ddd55f7461d585"
		assert read(READ_BYTE) == 0x0B
		USERNAME = read(READ_STRING, read(READ_BYTE))
		assert USERNAME == "IOException"
		assert read(READ_BYTE) == 0x0B
		REPLAY_HASH = read(READ_STRING, read(READ_BYTE))
		assert REPLAY_HASH == "4373a674c0f44f94d4295f3ea0a4eb5e"
		HIT300 = read(READ_SHORT)
		assert HIT300 == 515
		HIT100 = read(READ_SHORT)
		assert HIT100 == 9
		HIT50 = read(READ_SHORT)
		assert HIT50 == 1
		GEKI = read(READ_SHORT)
		assert GEKI == 101
		KATU = read(READ_SHORT)
		assert KATU == 5
		MISS = read(READ_SHORT)
		assert MISS == 0
		SCORE = read(READ_INT)
		assert SCORE == 13133580
		MAXCOMBO = read(READ_SHORT)
		assert MAXCOMBO == 832
		FULL_COMBO = read(READ_BYTE) == 1
		assert FULL_COMBO == True
		MODS = read(READ_INT)
		assert MODS == 0
	except:
		reset_position()
		return traceback.format_exc()
	reset_position()
	return True

@app.route("/", methods=["GET", "POST"])
def upload():
	failed = False
	if request.method == "POST":
		file = request.files["file"]
		if file and allowed_file(file.filename):
			filename = secure_filename(file.filename)
			filepath = os.path.join(app.config["UPLOAD_FOLDER"], filename)
			file.save(filepath)
			err = check(filepath)
			if err == True:
				return "sctf{+209pp!_am_i_cookiezi_now}"
			else:
				failed = err
			os.unlink(filepath)
	html = """
<!doctype html>
<title>Check .osr</title>
<h1>Check .osr</h1>
<form action="" method=post enctype=multipart/form-data>
  <p><input type=file name=file>
	 <input type=submit value=Upload>
</form>
	"""
	if type(failed) == type("failed"): html += "\n<pre style='display:none;'>\n" + failed + "\n</pre>"
	return html

app.run(host="0.0.0.0", port=8004)
