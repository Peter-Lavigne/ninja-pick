class Event < ApplicationRecord
  belongs_to :user
  has_many :ninjas, dependent: :destroy
  has_many :picks, dependent: :destroy

  validates :name, presence: true, uniqueness: true
end
