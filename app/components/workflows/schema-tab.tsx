// ============================================
// SchemaTab — Template input/output schema
// ============================================

import type { WorkflowTemplate } from '~/services/types';

/** Displays input and output schema for a workflow template */
export function SchemaTab({ template }: { template: WorkflowTemplate }) {
  const { inputSchema, outputSchema } = template;

  return (
    <div>
      {/* Input Schema */}
      <div className="detail-section bevel">
        <div className="detail-section-bar">
          <div className="art-stripe" />
          <span className="detail-section-title">Input Schema</span>
          <div className="art-stripe" />
        </div>
        <div className="detail-section-body">
          {inputSchema.description && (
            <p className="schema-desc">{inputSchema.description}</p>
          )}

          {inputSchema.fields.length > 0 && (
            <div className="schema-field-list">
              {inputSchema.fields.map((field) => (
                <div key={field.name} className="schema-field-row">
                  <div className="schema-field-header">
                    <span className="schema-field-name">{field.name}</span>
                    <span className={`schema-type-badge schema-type-${field.type}`}>
                      {field.type}
                    </span>
                    {field.required && (
                      <span className="schema-required">Required</span>
                    )}
                  </div>
                  <div className="schema-field-desc">{field.description}</div>
                  {field.type === 'enum' && field.options && field.options.length > 0 && (
                    <div className="schema-field-options">
                      {field.options.map((opt) => (
                        <span key={opt} className="schema-option-chip">{opt}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Output Schema */}
      <div className="detail-section bevel mt-3">
        <div className="detail-section-bar">
          <div className="art-stripe" />
          <span className="detail-section-title">Output Schema</span>
          <div className="art-stripe" />
        </div>
        <div className="detail-section-body">
          <div className="schema-output-meta">
            {outputSchema.format && (
              <span className={`file-chip ${outputSchema.format}`}>
                {outputSchema.format.toUpperCase()}
              </span>
            )}
            {outputSchema.destination && (
              <span className="schema-destination">{outputSchema.destination}</span>
            )}
          </div>

          {outputSchema.columns && outputSchema.columns.length > 0 && (
            <div className="schema-columns">
              <div className="schema-columns-label">Columns</div>
              <div className="schema-column-list">
                {outputSchema.columns.map((col) => (
                  <span key={col} className="schema-column-chip">{col}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
