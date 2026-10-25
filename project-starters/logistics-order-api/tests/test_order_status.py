import pytest

from src.domain.order_status import InvalidTransition, validate_transition


def test_unknown_transition_is_rejected():
    with pytest.raises(InvalidTransition):
        validate_transition("unknown", "unknown")
