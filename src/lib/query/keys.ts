const queryKeys = {
  demo: {
    all: ['demo'] as const,
    transactions: () => ['demo', 'transactions'] as const,
  },
};

export default queryKeys;
