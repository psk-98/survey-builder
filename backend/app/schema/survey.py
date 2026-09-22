from pydantic import BaseModel, model_validator


class Position(BaseModel):
    x: float
    y: float


class Option(BaseModel):
    id: str
    label: str


class NodeData(BaseModel):
    label: str
    content: str | None = None
    options: list[Option] = []


class Node(BaseModel):
    id: str
    type: str
    position: Position
    data: NodeData


class Edge(BaseModel):
    id: str
    source: str
    target: str
    sourceHandle: str | None = None


class SurveyDefinition(BaseModel):
    schemaVersion: int = 1
    title: str
    startNodeId: str
    nodes: list[Node]
    edges: list[Edge]

    @model_validator(mode="after")
    def validate_graph(self):

        node_ids = {node.id for node in self.nodes}

        # Check start node exists
        if self.startNodeId not in node_ids:
            raise ValueError("startNodeId does not exist")

        # Check edge references
        for edge in self.edges:
            if edge.source not in node_ids:
                raise ValueError(f"Invalid edge source: {edge.source}")

            if edge.target not in node_ids:
                raise ValueError(f"Invalid edge target: {edge.target}")

        return self


class CreateSurveyRequest(BaseModel):
    survey_definition: SurveyDefinition


class SurveyResponse(BaseModel):
    id: int
    name: str
    survey_definition: SurveyDefinition
