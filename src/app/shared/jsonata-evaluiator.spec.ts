import { JsonataEvaluator } from './jsonata-evaluator';

describe('JsonataEvaluator', () => {
  let evaluator: JsonataEvaluator;

  beforeEach(() => {
    evaluator = new JsonataEvaluator();
  });

  describe('isJsonataExpression', () => {
    it('should return true for valid JSONata expression', () => {
      const result = evaluator.isJsonataExpression('{{expression}}');
      expect(result).toBe(true);
    });

    it('should return false for non-JSONata expression', () => {
      const result = evaluator.isJsonataExpression('not an expression');
      expect(result).toBe(false);
    });
  });

  describe('evaluateJSONata', () => {
    it('should evaluate JSONata expression correctly', () => {
      const expression = '$sum([1, 2, 3])';
      const data = {};
      const result = JsonataEvaluator.evaluateJSONata(expression, data);
      expect(result).toBe(6);
    });
  });

  describe('evaluateParameter', () => {
    it('should evaluate parameter within string correctly', () => {
      const value = 'Hello {{name}}';
      const dataObject = { name: 'World' };
      const result = JsonataEvaluator.evaluateParameter(value, dataObject);
      expect(result).toBe('Hello World');
    });

    it('should return original value if parameter is not found', () => {
      const value = 'Hello {{name}}';
      const dataObject = {};
      const result = JsonataEvaluator.evaluateParameter(value, dataObject);
      expect(result).toBe('Hello {{name}}');
    });

    it('should handle nested parameters correctly', () => {
      const value = 'Value is {{nested.value}}';
      const dataObject = { nested: { value: '42' } };
      const result = JsonataEvaluator.evaluateParameter(value, dataObject);
      expect(result).toBe('Value is 42');
    });

    it('should handle invalid parameter syntax', () => {
      const value = 'Invalid {{parameter';
      const dataObject = {};
      const result = JsonataEvaluator.evaluateParameter(value, dataObject);
      expect(result).toBe('Invalid {{parameter');
    });

    it('should throw and log when jsonata throws in evaluateParameter', () => {
      const value = 'Hello {{invalid jsonata}}';
      const dataObject = {};

      expect(() => {
        JsonataEvaluator.evaluateParameter(value, dataObject);
      }).toThrow();
    });
  });

  describe('convertToBooleanIfNecessary', () => {
    it('should convert "true" to boolean true', () => {
      const result = JsonataEvaluator.convertToBooleanIfNecessary('true');
      expect(result).toBe(true);
    });

    it('should convert "false" to boolean false', () => {
      const result = JsonataEvaluator.convertToBooleanIfNecessary('false');
      expect(result).toBe(false);
    });

    it('should return original value if not "true" or "false"', () => {
      const result =
        JsonataEvaluator.convertToBooleanIfNecessary('some string');
      expect(result).toBe('some string');
    });
  });
});
