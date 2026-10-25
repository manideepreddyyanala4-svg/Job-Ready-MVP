class InvalidTransition(ValueError):
    """Raised when a shipment or order status change is not allowed."""


TRANSITIONS: dict[str, set[str]] = {}


def validate_transition(current: str, requested: str) -> None:
    """Validate a transition after the student defines the project policy."""
    allowed = TRANSITIONS.get(current, set())
    if requested not in allowed:
        raise InvalidTransition(f"Transition from {current!r} to {requested!r} is not allowed.")
