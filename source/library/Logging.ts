import chalk from 'chalk';

export default class Log {
	public static debug = (args: any) => console.log(chalk.blue(`[${new Date().toLocaleString()}] [DEBUG]`), typeof args === 'string' ? chalk.blue(args) : args);
	public static info = (args: any) => console.log(chalk.green(`[${new Date().toLocaleString()}] [INFO]`), typeof args === 'string' ? chalk.green(args) : args);
	public static warn = (args: any) => console.log(chalk.yellow(`[${new Date().toLocaleString()}] [WARN]`), typeof args === 'string' ? chalk.yellow(args) : args);
	public static error = (args: any) => console.log(chalk.red(`[${new Date().toLocaleString()}] [ERROR]`), typeof args === 'string' ? chalk.red(args) : args);
}
