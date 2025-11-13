import React, { useState } from 'react';
import { Wink, GroundedContent, Contact, Page } from '../types';
import { Icon } from './ui/Icon';
import { SocialPostGenerator } from './SocialPostGenerator';
import { MentalHealthDisclaimer } from './ui/MentalHealthDisclaimer';
import { SecondOpinionComposer } from './SecondOpinionComposer';
import { findLocalResources } from '../services/geminiService';

interface WinkDetailViewProps {
  wink: Wink;
  isOutbox: boolean;
  onSendSecondOpinion: (winkId: string, contacts: Contact[]) => void;
  contacts: Contact[];
  navigate: (page: Page) => void;
  isSelfCheckinView?: boolean;
}

export const LikelihoodBadge: React.FC<{ likelihood: 'low' | 'medium' | 'high' }> = ({ likelihood }) => {
  const colorClasses = {
    low: 'bg-emerald-100 text-emerald-800',
    medium: 'bg-amber-100 text-amber-800',
    high: 'bg-rose-100 text-rose-800',
  };
   const text = {
    low: 'Low Likelihood',
    medium: 'Medium Likelihood',
    high: 'High Likelihood',
   }
  return (
    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${colorClasses[likelihood]}`}>
      {text[likelihood]}
    </span>
  );
};

const GroundedResourceDisplay: React.FC<{ title: string, content: GroundedContent }> = ({ title, content }) => (
    <div className="p-4 sm:p-6 bg-brand-secondary-50 rounded-xl border border-brand-secondary-200">
        <h3 className="font-semibold text-brand-text-primary mb-3 text-lg">{title}</h3>
        <div className="prose prose-sm text-brand-text-secondary max-w-none" dangerouslySetInnerHTML={{ __html: content.text.replace(/\n/g, '<br />') }} />
        {content.sources.length > 0 && (
            <div className="mt-4">
                <p className="text-sm font-semibold text-brand-text-secondary mb-2">Sources & further reading:</p>
                <div className="flex flex-wrap gap-2">
                    {content.sources.map((source, index) => (
                        <a href={source.web?.uri || source.maps?.uri} target="_blank" rel="noopener noreferrer" key={index} className="text-sm bg-brand-primary-100 text-brand-primary-800 px-3 py-1.5 rounded-lg hover:bg-brand-primary-200 transition-colors flex items-center gap-1.5 interactive-scale">
                            <Icon name="link" className="w-4 h-4"/>
                            <span>{source.web?.title || source.maps?.title || 'Source'}</span>
                        </a>
                    ))}
                </div>
            </div>
        )}
    </div>
);


export const WinkDetailView: React.FC<WinkDetailViewProps> = ({ wink, isOutbox, onSendSecondOpinion, contacts, navigate, isSelfCheckinView = false }) => {
  const { aiContent, secondOpinion } = wink;
  const hasMentalHealthConcern = wink.observables.some(obs => obs.category === 'Mental');
  const [showSocialGenerator, setShowSocialGenerator] = useState(false);
  const [isComposingSecondOpinion, setIsComposingSecondOpinion] = useState(false);

  const [localResources, setLocalResources] = useState<GroundedContent | null>(wink.aiContent?.localResources || null);
  const [localResourcesLoading, setLocalResourcesLoading] = useState(false);
  const [localResourcesError, setLocalResourcesError] = useState<string | null>(null);

  const totalResponses = secondOpinion ? secondOpinion.agreements + secondOpinion.disagreements : 0;
  const agreementPercentage = secondOpinion && totalResponses > 0 ? (secondOpinion.agreements / totalResponses) * 100 : 0;
  
  const handleFindLocal = () => {
    if (!wink.aiContent) return;
    setLocalResourcesLoading(true);
    setLocalResourcesError(null);
    navigator.geolocation.getCurrentPosition(
        async (position) => {
            try {
                const { latitude, longitude } = position.coords;
                const localData = await findLocalResources(wink.aiContent!.possibleConditions, { latitude, longitude });
                setLocalResources(localData);
            } catch (err) {
                setLocalResourcesError(err instanceof Error ? err.message : 'Unknown error');
            } finally {
                setLocalResourcesLoading(false);
            }
        },
        (error) => {
            console.error("Geolocation error:", error);
            setLocalResourcesError("Could not get your location. Please enable location services in your browser.");
            setLocalResourcesLoading(false);
        }
    );
};

  if (isComposingSecondOpinion) {
    return <SecondOpinionComposer
        onClose={() => setIsComposingSecondOpinion(false)}
        onSend={(selectedContacts) => {
            onSendSecondOpinion(wink.id, selectedContacts);
            setIsComposingSecondOpinion(false);
        }}
        contacts={contacts}
    />;
  }


  return (
    <div className="space-y-8">
      <section>
        <h3 className="font-semibold text-brand-text-primary mb-3 text-lg flex items-center gap-2">
            <Icon name={isSelfCheckinView ? 'clipboardCheck' : 'userPlus'} className="w-5 h-5 text-brand-text-secondary"/>
            <span>{isSelfCheckinView ? 'You have noted:' : 'Someone has gently observed:'}</span>
        </h3>
        <div className="flex flex-wrap gap-3">
          {wink.observables.map(obs => (
            <div key={obs.id} className="bg-brand-secondary-100 text-brand-text-secondary text-sm px-3 py-1.5 rounded-full flex items-center gap-2">
                <Icon name="eye" className="w-4 h-4 text-brand-secondary-500" />
                <span>{obs.text}</span>
            </div>
          ))}
        </div>
      </section>

      {!isSelfCheckinView && hasMentalHealthConcern && <MentalHealthDisclaimer />}

      {secondOpinion ? (
        <section className="p-4 sm:p-5 bg-brand-secondary-50 rounded-xl border border-brand-secondary-200">
          <h3 className="font-semibold text-brand-text-primary mb-3 text-lg">Second Opinion Results</h3>
          <p className="text-sm text-brand-text-secondary mb-3">
            {totalResponses} of {secondOpinion.totalRequests} friends have responded.
          </p>
          <div className="w-full bg-brand-secondary-200 rounded-full h-4">
              <div 
                  className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-4 rounded-full" 
                  style={{ width: `${agreementPercentage}%` }}
              ></div>
          </div>
          <div className="flex justify-between text-sm font-semibold mt-2">
              <span className="flex items-center gap-1.5 text-emerald-700">
                  <Icon name="thumbsUp" className="w-4 h-4" /> 
                  {secondOpinion.agreements} Agree
              </span>
              <span className="flex items-center gap-1.5 text-rose-700">
                  <Icon name="thumbsDown" className="w-4 h-4" /> 
                  {secondOpinion.disagreements} Disagree
              </span>
          </div>
        </section>
      ) : (
          !isOutbox && !isSelfCheckinView && (
            <section className="border-t border-brand-secondary-200 pt-6">
                <h3 className="font-semibold text-brand-text-primary mb-2 text-lg">Need more certainty?</h3>
                <p className="text-sm text-brand-text-secondary mb-4">
                  You can confidentially ask a few trusted friends if they agree with these observations. They'll give a simple "agree" or "disagree" anonymously.
                </p>
                <button
                    onClick={() => setIsComposingSecondOpinion(true)}
                    className="w-full bg-brand-secondary-600 text-white font-semibold py-2.5 px-4 rounded-lg hover:bg-brand-secondary-700 transition-colors flex items-center justify-center gap-2 interactive-scale"
                >
                    <Icon name="share" className="w-4 h-4"/>
                    Get a Second Opinion
                </button>
            </section>
        )
      )}

      {aiContent && (
           <div className="bg-brand-primary-50 border-l-4 border-brand-primary-400 text-brand-primary-800 p-4 rounded-r-lg" role="alert">
              <p className="font-bold">A Note from WinkDrops AI</p>
              <p className="text-sm mt-1">{aiContent.disclaimer}</p>
          </div>
      )}

      {aiContent?.possibleConditions && (
        <section>
          <h3 className="font-semibold text-brand-text-primary mb-4 text-lg">Potential Insights</h3>
          <div className="space-y-4">
            {aiContent.possibleConditions.map(cond => (
              <div key={cond.name} className="bg-brand-secondary-50 p-4 rounded-xl border border-brand-secondary-200">
                  <div className="flex justify-between items-start gap-2">
                      <h4 className="font-bold text-brand-text-primary">{cond.name}</h4>
                      <LikelihoodBadge likelihood={cond.likelihood} />
                  </div>
                  <p className="text-sm text-brand-text-secondary mt-1.5">{cond.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}
      
      {aiContent?.resources && (
          <section>
              <h3 className="font-semibold text-brand-text-primary mb-4 text-lg">Helpful Resources</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {aiContent.resources.map(res => (
                      <a href="#" key={res.title} className="block bg-white p-4 rounded-xl border border-brand-secondary-200 hover:border-brand-primary-400 hover:shadow-lg hover:-translate-y-1 transition-all group interactive-scale">
                          <p className="font-semibold text-brand-primary-700 capitalize text-sm">{res.type}</p>
                          <h4 className="font-bold text-brand-text-primary group-hover:text-brand-primary-800">{res.title}</h4>
                          <p className="text-sm text-brand-text-secondary mt-1">{res.description}</p>
                      </a>
                  ))}
              </div>
                {!isOutbox && (
                <div className="mt-4 bg-gradient-to-br from-brand-secondary-50 to-brand-secondary-100 p-4 rounded-xl border-2 border-dashed border-brand-secondary-300 hover:border-brand-primary-400 hover:shadow-lg transition-all group text-center interactive-scale">
                    <button onClick={() => navigate('Wink Social')} className="w-full">
                        <h4 className="font-bold text-brand-text-primary group-hover:text-brand-primary-800 flex items-center justify-center gap-2">
                            <Icon name="quote" className="w-4 h-4" />
                            Connect with others in Wink Social
                        </h4>
                        <p className="text-sm text-brand-text-secondary mt-1">You are not alone. Find anonymous support forums based on these insights.</p>
                    </button>
                </div>
              )}
               <a href="mailto:partners@winkdrops.com?subject=Partnership%20Inquiry" className="block mt-4 bg-gradient-to-br from-brand-secondary-50 to-brand-secondary-100 p-4 rounded-xl border-2 border-dashed border-brand-secondary-300 hover:border-brand-primary-400 hover:shadow-lg transition-all group text-center interactive-scale">
                  <h4 className="font-bold text-brand-text-primary group-hover:text-brand-primary-800 flex items-center justify-center gap-2">
                      <Icon name="link" className="w-4 h-4" />
                      Want to see your resource listed here?
                  </h4>
                  <p className="text-sm text-brand-text-secondary mt-1">Contact us for partnership opportunities.</p>
              </a>
          </section>
      )}

      <section>
        {localResources ? (
          <GroundedResourceDisplay title="Local Support Near You" content={localResources} />
        ) : (
          !isOutbox && aiContent && (
            <div className="p-4 sm:p-6 bg-brand-secondary-50 rounded-xl border border-brand-secondary-200">
              <h3 className="font-semibold text-brand-text-primary mb-2 text-lg">Find Local Support</h3>
              <p className="text-sm text-brand-text-secondary mb-4">
                Use your current location to find nearby clinics, therapists, and support groups. This is a one-time search and your location will not be stored.
              </p>
              <button onClick={handleFindLocal} disabled={localResourcesLoading} className="flex items-center gap-2 text-sm font-semibold bg-brand-secondary-600 text-white px-4 py-2 rounded-lg hover:bg-brand-secondary-700 disabled:opacity-50 interactive-scale">
                {localResourcesLoading ? <Icon name="loader" className="w-4 h-4 animate-spin"/> : <Icon name="activity" className="w-4 h-4"/>}
                {localResourcesLoading ? 'Finding...' : 'Use My Location'}
              </button>
              {localResourcesError && <p className="text-xs text-red-600 mt-2">{localResourcesError}</p>}
            </div>
          )
        )}
      </section>
      
      {aiContent?.socialResources && (
        <section>
            <GroundedResourceDisplay title="Online Communities & Discussions" content={aiContent.socialResources} />
        </section>
      )}

      {aiContent && !isOutbox && !isSelfCheckinView && (
        <section className="border-t border-brand-secondary-200 pt-8 mt-4">
          {showSocialGenerator ? (
            <SocialPostGenerator aiContent={aiContent} onClose={() => setShowSocialGenerator(false)} />
          ) : (
            <div>
              <h3 className="font-semibold text-brand-text-primary mb-2 text-lg">Ready to Share?</h3>
              <p className="text-sm text-brand-text-secondary mb-4">Sharing your story can empower others and help break the stigma around mental and physical health. Generate sample posts to share on your social media.</p>
              <button 
                  onClick={() => setShowSocialGenerator(true)}
                  className="w-full bg-brand-text-primary text-white font-semibold py-2.5 px-4 rounded-lg hover:bg-brand-text-primary/90 transition-colors flex items-center justify-center gap-2 interactive-scale"
              >
                  <Icon name="share" className="w-4 h-4"/>
                  Generate Social Posts
              </button>
            </div>
          )}
        </section>
      )}
    </div>
  );
};