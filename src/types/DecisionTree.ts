export interface Condition {
  id: string;
  type: 'variable' | 'previous_choice' | 'node_visited';
  variable?: string;
  nodeId?: string;
  choiceId?: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'exists' | 'not_exists';
  value: string;
}

export interface Choice {
  id: string;
  label: string;
  nextNodeId?: string;
  conditions?: Condition[];
  setVariable?: { name: string; value: string };
}

export interface TreeNode {
  id: string;
  type: 'image' | 'dropdown';
  title: string;
  description?: string;
  imageUrl?: string;
  choices?: Choice[];
  isEnd?: boolean;
}

export interface DecisionTree {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  nodes: TreeNode[];
  rootNodeId: string;
  createdAt: Date;
}

export interface TreeState {
  currentNodeId: string;
  history: string[];
  variables: Record<string, string>;
  visitedNodes: Set<string>;
}