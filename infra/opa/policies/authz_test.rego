package sap_app_factory.authz

import future.keywords.if

test_non_prod_approval_allowed_for_delivery_lead if {
	allow with input as {
		"resource": "workflow",
		"action": "workflow:approve",
		"attributes": {"environment_kind": "dev", "roles": ["DeliveryLead"]},
	}
}

test_prod_approval_denied_for_same_actor if {
	not allow with input as {
		"resource": "workflow",
		"action": "workflow:approve",
		"attributes": {
			"environment_kind": "prod",
			"roles": ["DeliveryLead"],
			"approver_id": "user-1",
			"triggered_by_id": "user-1",
		},
	}
}

test_prod_approval_allowed_for_distinct_approver if {
	allow with input as {
		"resource": "workflow",
		"action": "workflow:approve",
		"attributes": {
			"environment_kind": "prod",
			"roles": ["DeliveryLead"],
			"approver_id": "user-2",
			"triggered_by_id": "user-1",
		},
	}
}

test_prod_approval_denied_without_delivery_lead_role if {
	not allow with input as {
		"resource": "workflow",
		"action": "workflow:approve",
		"attributes": {
			"environment_kind": "prod",
			"roles": ["Developer"],
			"approver_id": "user-2",
			"triggered_by_id": "user-1",
		},
	}
}

test_plain_permission_grant_allowed if {
	allow with input as {
		"resource": "project",
		"action": "create",
		"attributes": {"permissions": ["project:create"]},
	}
}

test_plain_permission_denied_without_grant if {
	not allow with input as {
		"resource": "project",
		"action": "create",
		"attributes": {"permissions": ["project:read"]},
	}
}
