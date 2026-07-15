# The one example policy bundle SAF-17 calls for (08-authentication-and-rbac.md).
# Implements the exact separation-of-duties example ADR-0011 itself gives:
# "workflow:approve requires environment.kind == 'prod' to also require a
# second distinct approver" — a real, meaningful rule, not a trivial
# always-allow stub, proving the OPA mechanism actually enforces something.
package sap_app_factory.authz

import future.keywords.if
import future.keywords.in

default allow := false

# Non-prod: coarse RBAC is enough — a DeliveryLead may approve.
allow if {
	input.action == "workflow:approve"
	input.attributes.environment_kind != "prod"
	"DeliveryLead" in input.attributes.roles
}

# Prod: same role requirement, plus separation of duties — the approver
# must not be the same actor who triggered the run.
allow if {
	input.action == "workflow:approve"
	input.attributes.environment_kind == "prod"
	"DeliveryLead" in input.attributes.roles
	input.attributes.approver_id != input.attributes.triggered_by_id
}

# Anything that isn't workflow:approve falls through to a plain permission
# bundle check: role must include a "resource:action" grant matching the
# request outright (the coarse RBAC layer ADR-0011 describes).
allow if {
	input.action != "workflow:approve"
	granted_permission := sprintf("%s:%s", [input.resource, input.action])
	granted_permission in input.attributes.permissions
}
