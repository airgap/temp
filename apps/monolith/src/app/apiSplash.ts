export const apiSplash = `
				<html>
					<head>
						<title>Lyku API</title>
						<style>
							html {
								font-family: sans-serif;
								text-align: center;
								background: #257;
								color: white;
							}
							h1, h2 {
								font-weight: 100;
								margin-top: calc(30vh - 20px);
							}
							a {
								color: white;
								text-decoration: none;
								opacity: .75;
								border-radius: 7px;
								outline: 2px solid white;
								padding: 5px;
								// outline-offset: 5px;
								margin-left: 5px;
								transition: .25s;
								display: inline-block;
								transform: scale(1.01);
							}
							a:hover {
								opacity: 1;
								transform: scale(1.05);
							}
						</style>
					</head>
					<body>
						<h1>
							Lyku API
						</h1>
						<h2>
							Check out the docs at <a href='https://lyku.org/docs/'>lyku.org/docs</a>
						</h2>
					</body>
				</html>
			`;
