import * as jsonata from 'jsonata';

export class JsonataEvaluator {
  public isJsonataExpression(value: string): boolean {
    // eslint-disable-next-line no-control-regex
    const regex = new RegExp('{{(\n|.)*}}');
    return regex.test(value);
  }

  public static evaluateJSONata(expression: string, data: unknown): unknown {
    return jsonata.default(expression).evaluate(data);
  }

  // the first pair element is the value and the second element signifies whether at least one parameter has not been replaced yet
  public static evaluateParameter(
    value: string,
    dataObject: unknown,
    replaceFinal?: boolean,
    returnUndefined?: boolean,
  ): unknown {
    const regex = new RegExp('{{(.|\\n)*?}}');
    if (!regex.test(value)) {
      return value;
    }
    let resultValue = value;
    const parameter = regex.exec(resultValue);
    if (!parameter) {
      return resultValue;
    }
    const paramSub = parameter[0].substring(2, parameter[0].length - 2).trim();
    let expr: jsonata.Expression;
    try {
      expr = jsonata.default(paramSub);
    } catch (e) {
      console.log(`:JsonataError:${e}`);
      console.log(e);
      throw e;
    }

    let result = expr.evaluate(dataObject) as unknown;

    if (result === undefined && (replaceFinal === undefined || !replaceFinal)) {
      // no match has been found, that is parameter is not loaded yet or not defined
      return resultValue;
    } else {
      if (result === undefined) {
        if (returnUndefined) {
          return result;
        }
        result = '';
      }
      resultValue = JsonataEvaluator.convertToBooleanIfNecessary(
        resultValue.replace(parameter[0], result as string),
      ) as string;
    }
    if (regex.test(resultValue)) {
      return this.evaluateParameter(resultValue, dataObject, replaceFinal);
    } else {
      return resultValue;
    }
  }

  public static convertToBooleanIfNecessary(value: string): unknown {
    switch (value) {
      case 'true':
        return true;
      case 'false':
        return false;
      default:
        return value;
    }
  }
}
