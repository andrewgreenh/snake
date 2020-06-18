import { aStar, AStarConfig } from "./aStar";

export interface LazyGraphConfig<DataType> {
  /**
   * Calculates cost between 2 neighbouring nodes.
   * Defaults to () => 1
   */
  getNeighbourCost?: (data1: DataType, data2: DataType) => number;

  /**
   * Returns neighbours of a given node.
   */
  getNeighbours: (data: DataType) => DataType[];

  /**
   * Returns a string representation of the node.
   * Defaults to JSON.stringify
   */
  hashData?: (data: DataType) => string;
}

export class LazyGraph<DataType> {
  private config: NonNullable<LazyGraphConfig<DataType>>;
  constructor(config: LazyGraphConfig<DataType>) {
    this.config = {
      hashData: (data) => JSON.stringify(data),
      getNeighbourCost: () => 1,
      ...config,
    };
  }

  findPath(
    config: Omit<AStarConfig<DataType>, keyof LazyGraphConfig<DataType>>
  ) {
    return aStar({ ...config, ...this.config });
  }
}
