# Nutrition Batches

Status: ACTIVE AND HISTORICAL GOVERNED BATCH DEFINITIONS

This folder contains governed batch definition files for Nutrition and related
governance work. Completed batches are retained as source-chain and audit
evidence; pending or newly created batches must still pass the operator gates.

## How To Use

Run batches through:

`system/workorders/cli/run-batch-operator.ts`

Use the exact batch path, project profile, and required orchestration mode from
the task. Do not dispatch files directly or bypass gates.

## Not Queue By Default

A batch file here is not active queue by existing on disk. Check its status,
project profile allowlist, documentation impact, approvals, stop rules, and
operator doctor result.

## Cleanup Rule

Do not move completed batches to archive in Phase 1. First add indexes and agree
on which batches are current, completed evidence, or stale.
