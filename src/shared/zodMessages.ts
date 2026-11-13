/** zod 4 dropped `required_error`: this keeps the message for a missing field only, not for a wrong type. */
export const required = (message: string) => ({
  error: (issue: { input?: unknown }) => (issue.input === undefined ? message : undefined),
});
