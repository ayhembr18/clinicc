import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

export default function MessagesAdminPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/contacts');
      setMessages(res.data);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const markRead = async (id) => {
    await api.put(`/contacts/${id}/read`);
    setMessages(prev => prev.map(m => m._id === id ? { ...m, isRead: true } : m));
    if (selected?._id === id) setSelected(s => ({ ...s, isRead: true }));
  };

  const deleteMessage = async (id) => {
    if (!window.confirm('Supprimer ce message ?')) return;
    await api.delete(`/contacts/${id}`);
    setMessages(prev => prev.filter(m => m._id !== id));
    if (selected?._id === id) setSelected(null);
  };

  const openMessage = async (m) => {
    setSelected(m);
    if (!m.isRead) await markRead(m._id);
  };

  const unreadCount = messages.filter(m => !m.isRead).length;
  const fmt = date => new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <div className="admin-page-title">
            Messages
            {unreadCount > 0 && (
              <span style={{ marginLeft: '10px', fontSize: '0.9rem', background: 'var(--green-100)', color: 'var(--green-700)', borderRadius: '100px', padding: '2px 10px', fontFamily: 'var(--font-body)' }}>
                {unreadCount} non lu{unreadCount > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <div className="admin-page-sub">{messages.length} message{messages.length !== 1 ? 's' : ''} au total</div>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
          <div className="loader"></div>
        </div>
      ) : messages.length === 0 ? (
        <div className="card" style={{ padding: '60px' }}>
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
            </svg>
            <p>Aucun message recu pour le moment.</p>
          </div>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '14px' }}></th>
                <th>Expediteur</th>
                <th>Contact</th>
                <th>Sujet</th>
                <th>Date</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {messages.map(m => (
                <tr key={m._id} style={{ fontWeight: m.isRead ? 400 : 600, cursor: 'pointer' }} onClick={() => openMessage(m)}>
                  <td>
                    {!m.isRead && (
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green-500)' }}></div>
                    )}
                  </td>
                  <td>{m.name}</td>
                  <td>
                    <div style={{ fontSize: '0.82rem' }}>{m.email}</div>
                    {m.phone && <div style={{ fontSize: '0.78rem', color: 'var(--gray-400)' }}>{m.phone}</div>}
                  </td>
                  <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {m.subject || <span style={{ color: 'var(--gray-400)', fontStyle: 'italic' }}>Sans sujet</span>}
                  </td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--gray-500)', whiteSpace: 'nowrap' }}>{fmt(m.createdAt)}</td>
                  <td onClick={e => e.stopPropagation()}>
                    <span className={`badge ${m.isRead ? 'badge-read' : 'badge-unread'}`}>
                      {m.isRead ? 'Lu' : 'Non lu'}
                    </span>
                  </td>
                  <td onClick={e => e.stopPropagation()}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {!m.isRead && (
                        <button className="btn btn-ghost btn-sm" onClick={() => markRead(m._id)}>
                          Marquer lu
                        </button>
                      )}
                      <button className="btn btn-danger btn-sm" onClick={() => deleteMessage(m._id)}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Message detail modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">{selected.subject || 'Message sans sujet'}</div>
              <button className="modal-close" onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                {[
                  ['De', selected.name],
                  ['Email', selected.email],
                  ['Telephone', selected.phone || '—'],
                  ['Date', fmt(selected.createdAt)],
                ].map(([label, value]) => (
                  <div key={label} style={{ display: 'flex', gap: '12px' }}>
                    <span style={{ fontSize: '0.82rem', color: 'var(--gray-400)', fontWeight: 600, width: '80px', flexShrink: 0 }}>{label}</span>
                    <span style={{ fontSize: '0.88rem', color: 'var(--gray-800)' }}>{value}</span>
                  </div>
                ))}
              </div>
              <div style={{ background: 'var(--gray-50)', borderRadius: 'var(--radius-sm)', padding: '16px', fontSize: '0.9rem', color: 'var(--gray-700)', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>
                {selected.message}
              </div>
            </div>
            <div className="modal-footer">
              <a href={`mailto:${selected.email}?subject=Re: ${selected.subject || 'Votre message'}`} className="btn btn-primary btn-sm">
                Repondre par email
              </a>
              <button className="btn btn-danger btn-sm" onClick={() => { deleteMessage(selected._id); setSelected(null); }}>
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}