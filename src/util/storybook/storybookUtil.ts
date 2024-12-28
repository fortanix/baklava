
export const storyDescription = (description: string) => ({
  parameters: {
    docs: {
      description: {
        story: description,
      },
    },
  },
}) as const;
