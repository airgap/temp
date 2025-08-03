import { ElasticLeaderboardService } from './elasticLeaderboardService';

describe('ElasticLeaderboardService Dynamic Stats', () => {
	// Mock the elasticsearch and redis clients
	jest.mock('@lyku/elasticsearch-client', () => ({
		client: {
			search: jest.fn(),
			index: jest.fn(),
			bulk: jest.fn(),
			indices: {
				create: jest.fn(),
				exists: jest.fn(),
			},
		},
	}));

	jest.mock('@lyku/redis-client', () => ({
		client: {
			get: jest.fn(),
			setex: jest.fn(),
			del: jest.fn(),
			keys: jest.fn(),
		},
	}));

	describe('processColumns', () => {
		it('should process columns into different storage formats', () => {
			// Access the private method for testing
			const processColumns = (ElasticLeaderboardService as any).processColumns;

			const columns = ['4:23.45', '3', '12', 'cloud_route', 'true'];
			const gameId = 1; // Mario speedrun game

			const result = processColumns(columns, gameId);

			expect(result.stats).toHaveProperty('column_0');
			expect(result.typedStats.numbers).toHaveProperty('column_1');
			expect(result.nestedStats).toHaveLength(5);
		});
	});

	describe('inferType', () => {
		it('should correctly infer column types', () => {
			const inferType = (ElasticLeaderboardService as any).inferType;

			expect(inferType('4:23.45')).toBe('time');
			expect(inferType('1:05:30.123')).toBe('time');
			expect(inferType('123')).toBe('number');
			expect(inferType('12.34')).toBe('number');
			expect(inferType('true')).toBe('boolean');
			expect(inferType('false')).toBe('boolean');
			expect(inferType('yes')).toBe('boolean');
			expect(inferType('no')).toBe('boolean');
			expect(inferType('cloud_route')).toBe('string');
			expect(inferType('easy')).toBe('string');
		});
	});

	describe('parseTimeToSeconds', () => {
		it('should parse time strings correctly', () => {
			const parseTimeToSeconds = (ElasticLeaderboardService as any)
				.parseTimeToSeconds;

			expect(parseTimeToSeconds('4:23.45')).toBe(263.45);
			expect(parseTimeToSeconds('1:05:30.123')).toBe(3930.123);
			expect(parseTimeToSeconds('30.5')).toBe(30.5);
		});
	});

	describe('parseValue', () => {
		it('should parse values based on type', () => {
			const parseValue = (ElasticLeaderboardService as any).parseValue;

			expect(parseValue('123', 'number')).toBe(123);
			expect(parseValue('4:23.45', 'time')).toBe(263.45);
			expect(parseValue('true', 'boolean')).toBe(true);
			expect(parseValue('false', 'boolean')).toBe(false);
			expect(parseValue('yes', 'boolean')).toBe(true);
			expect(parseValue('no', 'boolean')).toBe(false);
			expect(parseValue('test', 'string')).toBe('test');
		});
	});

	describe('getColumnSchema', () => {
		it('should return correct schema for known games', () => {
			const getColumnSchema = (ElasticLeaderboardService as any)
				.getColumnSchema;

			const marioSchema = getColumnSchema(1);
			expect(marioSchema).toHaveLength(3);
			expect(marioSchema[0]).toEqual({
				name: 'time',
				type: 'time',
				unit: 'seconds',
				description: 'Completion time',
				aggregatable: true,
				sortable: true,
			});

			const puzzleSchema = getColumnSchema(2);
			expect(puzzleSchema).toHaveLength(3);
			expect(puzzleSchema[0]).toEqual({
				name: 'score',
				type: 'number',
				unit: 'points',
				description: 'Final score',
				aggregatable: true,
				sortable: true,
			});
		});

		it('should return empty array for unknown games', () => {
			const getColumnSchema = (ElasticLeaderboardService as any)
				.getColumnSchema;

			const unknownSchema = getColumnSchema(999);
			expect(unknownSchema).toEqual([]);
		});
	});

	describe('Multi-game aggregation scenarios', () => {
		it('should handle Mario speedrun data correctly', () => {
			const processColumns = (ElasticLeaderboardService as any).processColumns;

			// Mario speedrun: time, deaths, power_ups
			const columns = ['4:23.45', '3', '12'];
			const result = processColumns(columns, 1);

			expect(result.stats.time).toBe(263.45);
			expect(result.stats.deaths).toBe(3);
			expect(result.stats.power_ups).toBe(12);

			expect(result.typedStats.times.time).toBe(263.45);
			expect(result.typedStats.numbers.deaths).toBe(3);
			expect(result.typedStats.numbers.power_ups).toBe(12);
		});

		it('should handle puzzle game data correctly', () => {
			const processColumns = (ElasticLeaderboardService as any).processColumns;

			// Puzzle game: score, moves, difficulty
			const columns = ['95000', '45', 'hard'];
			const result = processColumns(columns, 2);

			expect(result.stats.score).toBe(95000);
			expect(result.stats.moves).toBe(45);
			expect(result.stats.difficulty).toBe('hard');

			expect(result.typedStats.numbers.score).toBe(95000);
			expect(result.typedStats.numbers.moves).toBe(45);
			expect(result.typedStats.strings.difficulty).toBe('hard');
		});

		it('should handle racing game data correctly', () => {
			const processColumns = (ElasticLeaderboardService as any).processColumns;

			// Racing game: lap_time, total_time, top_speed, crashes, vehicle, weather
			const columns = ['1:32.45', '5:23.12', '185', '2', 'ferrari', 'sunny'];
			const result = processColumns(columns, 3);

			expect(result.stats.lap_time).toBe(92.45);
			expect(result.stats.total_time).toBe(323.12);
			expect(result.stats.top_speed).toBe(185);
			expect(result.stats.crashes).toBe(2);
			expect(result.stats.vehicle).toBe('ferrari');
			expect(result.stats.weather).toBe('sunny');
		});

		it('should handle fighting game data correctly', () => {
			const processColumns = (ElasticLeaderboardService as any).processColumns;

			// Fighting game: wins, losses, combo_max, damage_dealt, character, perfect_round
			const columns = ['15', '3', '23', '2450', 'ryu', 'true'];
			const result = processColumns(columns, 4);

			expect(result.stats.wins).toBe(15);
			expect(result.stats.losses).toBe(3);
			expect(result.stats.combo_max).toBe(23);
			expect(result.stats.damage_dealt).toBe(2450);
			expect(result.stats.character).toBe('ryu');
			expect(result.stats.perfect_round).toBe(true);

			expect(result.typedStats.booleans.perfect_round).toBe(true);
			expect(result.typedStats.strings.character).toBe('ryu');
		});
	});

	describe('Edge cases', () => {
		it('should handle empty columns array', () => {
			const processColumns = (ElasticLeaderboardService as any).processColumns;

			const result = processColumns([], 1);

			expect(result.stats).toEqual({});
			expect(result.typedStats.numbers).toEqual({});
			expect(result.typedStats.strings).toEqual({});
			expect(result.nestedStats).toEqual([]);
		});

		it('should handle columns with missing schema', () => {
			const processColumns = (ElasticLeaderboardService as any).processColumns;

			// More columns than schema defines
			const columns = ['4:23.45', '3', '12', 'extra_column'];
			const result = processColumns(columns, 1);

			expect(result.stats).toHaveProperty('column_3');
			expect(result.stats.column_3).toBe('extra_column');
		});

		it('should handle invalid time formats gracefully', () => {
			const parseTimeToSeconds = (ElasticLeaderboardService as any)
				.parseTimeToSeconds;

			expect(parseTimeToSeconds('invalid')).toBeNaN();
			expect(parseTimeToSeconds('')).toBe(0);
		});

		it('should handle invalid numeric values', () => {
			const parseValue = (ElasticLeaderboardService as any).parseValue;

			expect(parseValue('not_a_number', 'number')).toBe(0);
			expect(parseValue('', 'number')).toBe(0);
		});
	});

	describe('Integration scenarios', () => {
		it('should create proper document structure for indexing', () => {
			const processColumns = (ElasticLeaderboardService as any).processColumns;

			const columns = ['4:23.45', '3', '12', 'cloud_route', 'true'];
			const gameId = 1;
			const result = processColumns(columns, gameId);

			// Verify all three storage strategies are populated
			expect(Object.keys(result.stats)).toHaveLength(5);
			expect(Object.keys(result.typedStats.numbers)).toBeGreaterThan(0);
			expect(Object.keys(result.typedStats.strings)).toBeGreaterThan(0);
			expect(Object.keys(result.typedStats.times)).toBeGreaterThan(0);
			expect(Object.keys(result.typedStats.booleans)).toBeGreaterThan(0);
			expect(result.nestedStats).toHaveLength(5);

			// Verify nested stats have proper metadata
			result.nestedStats.forEach((stat) => {
				expect(stat).toHaveProperty('name');
				expect(stat).toHaveProperty('value');
				expect(stat).toHaveProperty('type');
				expect(['number', 'string', 'time', 'boolean']).toContain(stat.type);
			});
		});
	});
});
