export const exceptionHandler = async (ctx, next) => {
    try {
        return await next();
    }
    catch (err) {
        ctx.body = {message: err.message || 'Unexpected error.'};
        ctx.status = err.status || 500;
    }
};
