<?php
$thepassword_123 = file_get_contents("files/thepassword.txt");
$theflag = file_get_contents("files/theflag.txt");
?>
<html>
	<head>
		<title>The Ducks</title>
		<link href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-1q8mTJOASx8j1Au+a5WDVnPi2lkFfwwEAa8hDDdjZlpLegxhjVME1fgjWPGmkzs7" crossorigin="anonymous">
		<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.min.js" integrity="sha384-0mSbJDEHialfmuBBQP6A4Qrprq5OVfW37PRR3j5ELqxss1yVqOtnepnHVP9aJ7xS" crossorigin="anonymous"></script>
	</head>
	<body>
		<div class="container">
			<div class="jumbotron">
				<center>
					<h1>The Ducks</h1>
					<?php if ($_SERVER["REQUEST_METHOD"] == "POST") { ?>
						<?php
						extract($_POST);
						if ($pass == $thepassword_123) { ?>
							<div class="alert alert-success">
								<code><?php echo $theflag; ?></code>
							</div>
						<?php } ?>
					<?php } ?>
					<form action="/" method="POST">
						<div class="row">
							<div class="col-md-6">
								<div class="row">
									<div class="col-md-9">
										<input type="password" class="form-control" name="pass" placeholder="Password" />
									</div>
									<div class="col-md-3">
										<input type="submit" class="btn btn-primary" value="Submit" />
									</div>
								</div>
							</div>
						</div>
					</form>
				</center>
			</div>
		</div>
	</body>
</html>