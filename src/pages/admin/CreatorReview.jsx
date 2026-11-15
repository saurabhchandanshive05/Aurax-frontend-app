import React, { useState, useEffect, useCallback } from 'react';
import AdminNav from '../../components/admin/AdminNav';
import styles from './CampaignCurator.module.css';
import { getApiEndpoint } from '../../utils/getApiUrl';

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

const CreatorReview = () => {
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchPending = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(getApiEndpoint('/api/onboarding/admin/pending'), {
        headers: authHeaders(),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to fetch pending creators');
      }
      setCreators(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  const handleDecision = async (creator, action) => {
    let body = {};
    if (action === 'reject') {
      const reason = window.prompt(`Reason for rejecting ${creator.email}:`);
      if (!reason || !reason.trim()) return;
      body = { reason: reason.trim() };
    } else if (!window.confirm(`Approve ${creator.email}?`)) {
      return;
    }

    setBusyId(creator._id);
    setError('');
    setSuccess('');
    try {
      const response = await fetch(
        getApiEndpoint(`/api/onboarding/admin/${action}/${creator._id}`),
        { method: 'POST', headers: authHeaders(), body: JSON.stringify(body) }
      );
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) {
        throw new Error(data.message || `Failed to ${action} creator`);
      }
      setCreators((prev) => prev.filter((c) => c._id !== creator._id));
      setSuccess(`Creator ${action === 'approve' ? 'approved' : 'rejected'}: ${creator.email}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <AdminNav />
      <div className={styles.mainContent}>
        <div className={styles.curatorContainer}>
          <div className={styles.curatorHeader}>
            <div>
              <h1>Creator Review</h1>
              <p>AURAX LIVE - Admin Dashboard</p>
            </div>
            <button className={styles.addBtn} onClick={fetchPending} disabled={loading}>
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>

          {error && <div className={`${styles.alert} ${styles.error}`}>{error}</div>}
          {success && <div className={`${styles.alert} ${styles.success}`}>{success}</div>}

          <div className={styles.campaignsList}>
            <h2>Pending Creators ({creators.length})</h2>
            {!loading && creators.length === 0 && !error && <p>No creators are waiting for review.</p>}
            <div className={styles.campaignsGrid}>
              {creators.map((creator) => (
                <div key={creator._id} className={styles.campaignCard}>
                  <div className={styles.cardHeader}>
                    <div className={styles.headerLeft}>
                      <div className={styles.avatarPlaceholder}>
                        {(creator.creatorUsername || creator.username || creator.email || '?').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3>{creator.creatorUsername || creator.username || 'Unnamed creator'}</h3>
                        <p className={styles.company}>{creator.email}</p>
                      </div>
                    </div>
                  </div>

                  <div className={styles.cardBody}>
                    <div className={styles.detail}>
                      <strong>Instagram:</strong> {creator.instagramHandle ? `@${creator.instagramHandle}` : '-'}
                    </div>
                    <div className={styles.detail}>
                      <strong>Niche:</strong> {creator.primaryNiche || '-'}
                    </div>
                    <div className={styles.detail}>
                      <strong>Followers:</strong> {creator.followerCount || '-'}
                    </div>
                    <div className={styles.detail}>
                      <strong>Country:</strong> {creator.country || '-'}
                    </div>
                    <div className={styles.detail}>
                      <strong>Submitted:</strong>{' '}
                      {creator.profileSubmittedAt ? new Date(creator.profileSubmittedAt).toLocaleDateString() : '-'}
                    </div>
                  </div>

                  <div className={styles.cardActions}>
                    <button
                      className={styles.actionBtn}
                      onClick={() => handleDecision(creator, 'approve')}
                      disabled={busyId === creator._id}
                    >
                      ✓ Approve
                    </button>
                    <button
                      className={`${styles.actionBtn} ${styles.delete}`}
                      onClick={() => handleDecision(creator, 'reject')}
                      disabled={busyId === creator._id}
                    >
                      ✕ Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatorReview;
